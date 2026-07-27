import {
  getMeta,
  getTombstones,
  listCases,
  mergeCases,
  setMeta,
  type MergeResult,
  type Tombstones,
} from './db';
import { deidentifyCases } from './deidentify';
import type { PreopCase } from '../types';

/**
 * Sync between devices through a single file the user keeps in their own
 * cloud drive (iCloud Drive, OneDrive, Box) - no server of ours in the
 * middle, and the data never leaves storage they already control.
 *
 * On desktop Chrome/Edge the File System Access API lets the app read and
 * write that file in place, so syncing is one click after a one-time pick.
 * Safari - including iOS - has no such API, so there the same file is moved
 * by exporting and importing through the share sheet.
 */

const HANDLE_KEY = 'syncFileHandle';
const LAST_SYNC_KEY = 'lastSyncAt';

export interface SyncPayload {
  app: 'preop-app';
  version: 1;
  deidentified?: boolean;
  updatedAt: string;
  cases: PreopCase[];
  deletions?: Tombstones;
}

// Minimal typings - the File System Access API isn't in lib.dom yet.
interface FileSystemWritable {
  write(data: string): Promise<void>;
  close(): Promise<void>;
}
export interface SyncFileHandle {
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritable>;
  queryPermission?(descriptor: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;
  requestPermission?(descriptor: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;
}

interface FilePickerWindow {
  showSaveFilePicker?: (options: unknown) => Promise<SyncFileHandle>;
  showOpenFilePicker?: (options: unknown) => Promise<SyncFileHandle[]>;
}

export function isFileSyncSupported(): boolean {
  const w = window as unknown as FilePickerWindow;
  return typeof w.showSaveFilePicker === 'function' && typeof w.showOpenFilePicker === 'function';
}

const PICKER_OPTIONS = {
  suggestedName: 'preop-cases.json',
  types: [{ description: 'Preop cases', accept: { 'application/json': ['.json'] } }],
};

/** Prompts for the sync file and remembers it for next time. */
export async function chooseSyncFile(mode: 'existing' | 'new'): Promise<SyncFileHandle | null> {
  const w = window as unknown as FilePickerWindow;
  try {
    const handle =
      mode === 'existing'
        ? (await w.showOpenFilePicker!({ ...PICKER_OPTIONS, multiple: false }))[0]
        : await w.showSaveFilePicker!(PICKER_OPTIONS);
    await setMeta(HANDLE_KEY, handle);
    return handle;
  } catch {
    // The user dismissed the picker.
    return null;
  }
}

export async function storedSyncFile(): Promise<SyncFileHandle | undefined> {
  return getMeta<SyncFileHandle>(HANDLE_KEY);
}

export async function forgetSyncFile(): Promise<void> {
  await setMeta(HANDLE_KEY, undefined);
}

export async function lastSyncedAt(): Promise<string | undefined> {
  return getMeta<string>(LAST_SYNC_KEY);
}

/** File handles need permission re-granted in each new session. */
async function ensureWritePermission(handle: SyncFileHandle): Promise<boolean> {
  const descriptor = { mode: 'readwrite' as const };
  if ((await handle.queryPermission?.(descriptor)) === 'granted') return true;
  return (await handle.requestPermission?.(descriptor)) === 'granted';
}

export function buildSyncPayload(cases: PreopCase[], deletions: Tombstones, deidentified: boolean): string {
  const payload = {
    app: 'preop-app' as const,
    version: 1 as const,
    deidentified,
    updatedAt: new Date().toISOString(),
    cases: deidentified ? deidentifyCases(cases).cases : cases,
    deletions,
  };
  return JSON.stringify(payload, null, 2);
}

export function parseSyncPayload(text: string): SyncPayload {
  const parsed = JSON.parse(text) as Partial<SyncPayload>;
  if (parsed.app !== 'preop-app' || !Array.isArray(parsed.cases)) {
    throw new Error("That file isn't a Preop Assistant sync file.");
  }
  return parsed as SyncPayload;
}

export interface SyncOutcome extends MergeResult {
  wrote: number;
  fileName: string;
}

/**
 * One sync pass: pull whatever the other device wrote, merge it in, then
 * write the combined set back so both ends converge.
 */
export async function syncNow(handle: SyncFileHandle, deidentified: boolean): Promise<SyncOutcome> {
  if (!(await ensureWritePermission(handle))) {
    throw new Error('Permission to use that file was declined.');
  }

  // Pull - an empty or brand-new file just means nothing to merge yet.
  let merged: MergeResult = { added: 0, updated: 0, skipped: 0, deleted: 0 };
  const file = await handle.getFile();
  const text = (await file.text()).trim();
  if (text) {
    const payload = parseSyncPayload(text);
    if (payload.deidentified) {
      throw new Error(
        'That file holds de-identified cases, which can\'t be merged back (dates and CSN were removed). Pick a different file for syncing.',
      );
    }
    merged = await mergeCases(payload.cases, payload.deletions ?? {});
  }

  // Push the combined state back.
  const cases = await listCases();
  const deletions = await getTombstones();
  const writable = await handle.createWritable();
  await writable.write(buildSyncPayload(cases, deletions, deidentified));
  await writable.close();

  await setMeta(LAST_SYNC_KEY, new Date().toISOString());
  return { ...merged, wrote: cases.length, fileName: handle.name };
}
