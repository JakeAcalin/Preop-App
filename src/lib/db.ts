import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { FieldValues, PreopCase } from '../types';
import { FIELDS } from '../data/fields';
import { defaultCaseDate, toISODate } from './caseDate';

interface PreopDB extends DBSchema {
  cases: {
    key: string;
    value: PreopCase;
    indexes: { 'by-updatedAt': number };
  };
}

let dbPromise: Promise<IDBPDatabase<PreopDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<PreopDB>('preop-app', 1, {
      upgrade(db) {
        const store = db.createObjectStore('cases', { keyPath: 'id' });
        store.createIndex('by-updatedAt', 'updatedAt');
      },
    });
  }
  return dbPromise;
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

export interface ImportResult {
  added: number;
  updated: number;
  skipped: number;
}

/**
 * Restores cases from a backup file. Cases are merged by id: an incoming case
 * replaces the stored one only when it is newer, so importing an older backup
 * never overwrites more recent work.
 */
export async function importCases(json: string): Promise<ImportResult> {
  const parsed = JSON.parse(json) as Partial<BackupFile>;
  if (parsed.app !== 'preop-app' || !Array.isArray(parsed.cases)) {
    throw new Error("That doesn't look like a Preop Assistant backup file.");
  }

  const result: ImportResult = { added: 0, updated: 0, skipped: 0 };

  for (const incoming of parsed.cases) {
    if (!incoming?.id) {
      result.skipped += 1;
      continue;
    }
    const existing = await getCase(incoming.id);
    if (!existing) {
      await saveCase(migrateCase(incoming));
      result.added += 1;
    } else if ((incoming.updatedAt ?? 0) > (existing.updatedAt ?? 0)) {
      await saveCase(migrateCase(incoming));
      result.updated += 1;
    } else {
      result.skipped += 1;
    }
  }

  return result;
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
