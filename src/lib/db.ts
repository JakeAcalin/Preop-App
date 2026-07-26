import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { PreopCase } from '../types';
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
 * Cases saved before caseDate/caseNumber existed carried a free-text
 * `patientLabel` and no case date. Fill those in from the creation date so
 * older cases keep working and keep their original label.
 */
function migrateCase(stored: PreopCase & { patientLabel?: string }): PreopCase {
  if (stored.caseDate && stored.caseNumber) return stored;
  const { patientLabel, ...rest } = stored;
  return {
    ...rest,
    caseDate: stored.caseDate ?? toISODate(new Date(stored.createdAt)),
    caseNumber: stored.caseNumber ?? 1,
    customLabel: stored.customLabel ?? patientLabel,
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
