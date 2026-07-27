import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { FieldValues, PreopCase } from '../types';
import { FIELDS } from '../data/fields';
import { defaultCaseDate, toISODate } from './caseDate';
import { deidentifyCases, type Redaction } from './deidentify';

/** id -> time it was deleted, so a sync doesn't resurrect deleted cases. */
export type Tombstones = Record<string, number>;

interface PreopDB extends DBSchema {
  cases: {
    key: string;
    value: PreopCase;
    indexes: { 'by-updatedAt': number };
  };
  meta: {
    key: string;
    value: unknown;
  };
}

let dbPromise: Promise<IDBPDatabase<PreopDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<PreopDB>('preop-app', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore('cases', { keyPath: 'id' });
          store.createIndex('by-updatedAt', 'updatedAt');
        }
        // v2 adds a meta store for the sync file handle, deletion tombstones
        // and the last sync time.
        if (oldVersion < 2) {
          db.createObjectStore('meta');
        }
      },
    });
  }
  return dbPromise;
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  return (await db.get('meta', key)) as T | undefined;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put('meta', value, key);
}

export async function getTombstones(): Promise<Tombstones> {
  return (await getMeta<Tombstones>('deletions')) ?? {};
}

/**
 * Fields have changed type between versions (several free-text and dropdown
 * fields became chip pickers). A value saved under the old type would render
 * as blank under the new one - present in storage but invisible, and liable
 * to be overwritten on the next edit. Coerce every value to the shape its
 * field expects today so nothing entered previously is lost.
 */
function migrateValues(values: FieldValues): FieldValues {
  const migrated: FieldValues = { ...values };

  for (const field of FIELDS) {
    const value = migrated[field.id];
    if (value === undefined) continue;

    if (field.type === 'multiselect' && typeof value === 'string') {
      // Free text was joined with '; ' as it was dictated; split it back out
      // so each part becomes its own chip.
      const parts = value
        .split(/\s*;\s*/)
        .map((p) => p.trim())
        .filter(Boolean);
      migrated[field.id] = parts;
    } else if (field.type !== 'multiselect' && Array.isArray(value)) {
      migrated[field.id] = value.join('; ');
    }
  }

  return migrated;
}

/**
 * Cases saved before caseDate/caseNumber existed carried a free-text
 * `patientLabel` and no case date. Fill those in from the creation date so
 * older cases keep working and keep their original label.
 */
function migrateCase(stored: PreopCase & { patientLabel?: string }): PreopCase {
  const { patientLabel, ...rest } = stored;
  return {
    ...rest,
    caseDate: stored.caseDate ?? toISODate(new Date(stored.createdAt)),
    caseNumber: stored.caseNumber ?? 1,
    customLabel: stored.customLabel ?? patientLabel,
    values: migrateValues(stored.values ?? {}),
    unsorted: stored.unsorted ?? [],
  };
}

export async function listCases(): Promise<PreopCase[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('cases', 'by-updatedAt');
  return all.reverse().map(migrateCase);
}

export async function getCase(id: string): Promise<PreopCase | undefined> {
  const db = await getDB();
  const stored = await db.get('cases', id);
  return stored ? migrateCase(stored) : undefined;
}

export async function saveCase(preopCase: PreopCase): Promise<void> {
  const db = await getDB();
  await db.put('cases', preopCase);
}

export async function deleteCase(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('cases', id);
  // Remember the deletion, otherwise the next sync pulls the case back in
  // from a device that hasn't heard about it yet.
  const tombstones = await getTombstones();
  tombstones[id] = Date.now();
  await setMeta('deletions', tombstones);
}

export interface MergeResult {
  added: number;
  updated: number;
  skipped: number;
  deleted: number;
}

/**
 * Merges incoming cases into local storage. A case is taken only when it is
 * newer than the local copy, so syncing an older file never overwrites more
 * recent work, and deletions from either side are honoured.
 */
export async function mergeCases(
  incoming: PreopCase[],
  incomingTombstones: Tombstones = {},
): Promise<MergeResult> {
  const result: MergeResult = { added: 0, updated: 0, skipped: 0, deleted: 0 };

  const tombstones = await getTombstones();
  for (const [id, deletedAt] of Object.entries(incomingTombstones)) {
    if (!tombstones[id] || deletedAt > tombstones[id]) tombstones[id] = deletedAt;
  }

  for (const candidate of incoming) {
    if (!candidate?.id) {
      result.skipped += 1;
      continue;
    }

    const deletedAt = tombstones[candidate.id];
    if (deletedAt !== undefined && deletedAt >= (candidate.updatedAt ?? 0)) {
      result.skipped += 1;
      continue;
    }

    const existing = await getCase(candidate.id);
    if (!existing) {
      await saveCase(migrateCase(candidate));
      result.added += 1;
    } else if ((candidate.updatedAt ?? 0) > (existing.updatedAt ?? 0)) {
      await saveCase(migrateCase(candidate));
      result.updated += 1;
    } else {
      result.skipped += 1;
    }
  }

  // Apply deletions that happened on the other device.
  const db = await getDB();
  for (const [id, deletedAt] of Object.entries(tombstones)) {
    const existing = await db.get('cases', id);
    if (existing && deletedAt >= (existing.updatedAt ?? 0)) {
      await db.delete('cases', id);
      result.deleted += 1;
    }
  }

  await setMeta('deletions', tombstones);
  return result;
}

/**
 * Next case number for a given date of surgery - cases are numbered per
 * operative date, so moving a case to a different day renumbers it against
 * that day's list rather than the day it was dictated.
 */
export async function nextCaseNumber(caseDate: string, excludeId?: string): Promise<number> {
  const existing = await listCases();
  const sameDay = existing.filter((c) => c.caseDate === caseDate && c.id !== excludeId);
  return sameDay.length + 1;
}

interface BackupFile {
  app: 'preop-app';
  version: 1;
  exportedAt: string;
  cases: PreopCase[];
}

/**
 * All cases with identifiers removed and dates cut to the year, for a copy
 * that can be synced or shared. Returns the redactions made so they can be
 * reviewed before the file leaves the device.
 */
export async function exportDeidentified(): Promise<{ json: string; redactions: Redaction[] }> {
  const { cases, redactions } = deidentifyCases(await listCases());
  const payload = {
    app: 'preop-app',
    version: 1,
    deidentified: true,
    exportedAt: new Date().toISOString(),
    cases,
  };
  return { json: JSON.stringify(payload, null, 2), redactions };
}

/** All cases as a JSON backup file the user can keep off-device. */
export async function exportCases(): Promise<string> {
  const cases = await listCases();
  const backup: BackupFile = {
    app: 'preop-app',
    version: 1,
    exportedAt: new Date().toISOString(),
    cases,
  };
  return JSON.stringify(backup, null, 2);
}

export type ImportResult = MergeResult;

/**
 * Restores cases from a backup or sync file. Cases are merged by id: an
 * incoming case replaces the stored one only when it is newer, so importing
 * an older backup never overwrites more recent work.
 */
export async function importCases(json: string): Promise<ImportResult> {
  const parsed = JSON.parse(json) as Partial<BackupFile> & { deletions?: Tombstones; deidentified?: boolean };
  if (parsed.app !== 'preop-app' || !Array.isArray(parsed.cases)) {
    throw new Error("That doesn't look like a Preop Assistant backup file.");
  }
  if (parsed.deidentified) {
    throw new Error(
      'That file holds de-identified cases - dates and CSN were removed, so it can\'t be restored as working cases.',
    );
  }

  return mergeCases(parsed.cases, parsed.deletions ?? {});
}

export async function createCase(): Promise<PreopCase> {
  const now = Date.now();
  const caseDate = defaultCaseDate();
  const preopCase: PreopCase = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    caseDate,
    caseNumber: await nextCaseNumber(caseDate),
    procedureType: '',
    values: {},
    unsorted: [],
  };
  await saveCase(preopCase);
  return preopCase;
}
