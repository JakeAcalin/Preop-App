export type PersistenceState = 'persisted' | 'best-effort' | 'unsupported';

export interface StorageStatus {
  state: PersistenceState;
  /** Bytes currently used by the app, when the browser reports it. */
  usageBytes?: number;
}

/**
 * Asks the browser to mark this site's storage as persistent.
 *
 * Without it, IndexedDB is "best-effort" and can be evicted when the device
 * is low on space - which is the real reason a case could ever vanish, since
 * nothing here is stored anywhere else. Granting is at the browser's
 * discretion; installing to the home screen makes it far more likely.
 */
export async function ensurePersistentStorage(): Promise<StorageStatus> {
  if (!navigator.storage?.estimate) {
    return { state: 'unsupported' };
  }

  let persisted = false;
  try {
    persisted = (await navigator.storage.persisted?.()) ?? false;
    if (!persisted && navigator.storage.persist) {
      persisted = await navigator.storage.persist();
    }
  } catch {
    // Treat any failure as simply not granted.
    persisted = false;
  }

  let usageBytes: number | undefined;
  try {
    usageBytes = (await navigator.storage.estimate()).usage;
  } catch {
    usageBytes = undefined;
  }

  return { state: persisted ? 'persisted' : 'best-effort', usageBytes };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
