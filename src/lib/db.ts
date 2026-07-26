import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { PreopCase } from '../types';

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

export async function listCases(): Promise<PreopCase[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('cases', 'by-updatedAt');
  return all.reverse();
}

export async function getCase(id: string): Promise<PreopCase | undefined> {
  const db = await getDB();
  return db.get('cases', id);
}

export async function saveCase(preopCase: PreopCase): Promise<void> {
  const db = await getDB();
  await db.put('cases', preopCase);
}

export async function deleteCase(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('cases', id);
}

function formatDateLabel(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

/**
 * Builds the next case label for today, e.g. "07/25/26; Case 1". The case
 * number counts cases created on the same calendar day, so it restarts at 1
 * each morning.
 */
export async function nextCaseLabel(): Promise<string> {
  const now = new Date();
  const existing = await listCases();
  const todayCount = existing.filter((c) => isSameDay(new Date(c.createdAt), now)).length;
  return `${formatDateLabel(now)}; Case ${todayCount + 1}`;
}

export async function createCase(): Promise<PreopCase> {
  const now = Date.now();
  const preopCase: PreopCase = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    patientLabel: await nextCaseLabel(),
    procedureType: '',
    values: {},
    unsorted: [],
  };
  await saveCase(preopCase);
  return preopCase;
}
