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

export function newCase(patientLabel: string, procedureType: string): PreopCase {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    patientLabel,
    procedureType,
    values: {},
    unsorted: [],
  };
}
