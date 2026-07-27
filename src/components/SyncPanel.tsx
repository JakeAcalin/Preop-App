import { useEffect, useState } from 'react';
import {
  chooseSyncFile,
  forgetSyncFile,
  isFileSyncSupported,
  lastSyncedAt,
  storedSyncFile,
  syncNow,
  type SyncFileHandle,
} from '../lib/syncFile';

interface Props {
  /** Called after a sync changes local data so the list can refresh. */
  onSynced: () => void;
}

function describeWhen(iso: string | undefined): string {
  if (!iso) return 'never';
  const date = new Date(iso);
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h ago`;
  return date.toLocaleDateString();
}

export default function SyncPanel({ onSynced }: Props) {
  const [handle, setHandle] = useState<SyncFileHandle | undefined>();
  const [lastSync, setLastSync] = useState<string | undefined>();
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const supported = isFileSyncSupported();

  useEffect(() => {
    storedSyncFile().then(setHandle);
    lastSyncedAt().then(setLastSync);
  }, []);

  async function handleSync() {
    if (!handle) return;
    setBusy(true);
    setStatus(null);
    try {
      const result = await syncNow(handle, false);
      setLastSync(new Date().toISOString());
      const changes = [
        result.added ? `${result.added} added` : null,
        result.updated ? `${result.updated} updated` : null,
        result.deleted ? `${result.deleted} deleted` : null,
      ].filter(Boolean);
      setStatus(
        changes.length > 0
          ? `Synced: ${changes.join(', ')}. ${result.wrote} case(s) now in ${result.fileName}.`
          : `Already up to date. ${result.wrote} case(s) in ${result.fileName}.`,
      );
      onSynced();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Sync failed.');
    } finally {
      setBusy(false);
    }
  }

  async function pick(mode: 'existing' | 'new') {
    const picked = await chooseSyncFile(mode);
    if (picked) {
      setHandle(picked);
      setStatus(`Sync file set to ${picked.name}. Tap Sync now to start.`);
    }
  }

  if (!supported) {
    return (
      <div className="card">
        <h4>Sync to another device</h4>
        <p className="muted small">
          This browser can't sync a file in place - that's Safari, including on iPhone. Use <strong>Export backup</strong>{' '}
          here and save it into iCloud Drive (or your hospital's OneDrive/Box) via the share sheet, then open the same
          file with <strong>Restore</strong> on the other device. On a computer running Chrome or Edge, this panel
          becomes one-click sync.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h4>Sync to another device</h4>

      {handle ? (
        <>
          <p className="muted small">
            Sync file: <strong>{handle.name}</strong> - last synced {describeWhen(lastSync)}.
          </p>
          <div className="backup-bar">
            <button className="primary small" onClick={handleSync} disabled={busy}>
              {busy ? 'Syncing...' : 'Sync now'}
            </button>
            <button className="small" onClick={() => pick('existing')} disabled={busy}>
              Change file
            </button>
            <button
              className="small"
              onClick={async () => {
                await forgetSyncFile();
                setHandle(undefined);
                setStatus('Stopped syncing. Nothing was deleted.');
              }}
              disabled={busy}
            >
              Stop syncing
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="muted small">
            Keep one file in a cloud drive you already use and both devices read and write it - no server involved.
            Pick the same file on each device.
          </p>
          <div className="backup-bar">
            <button className="primary small" onClick={() => pick('new')}>
              Create sync file
            </button>
            <button className="small" onClick={() => pick('existing')}>
              Use existing file
            </button>
          </div>
        </>
      )}

      {status && <p className="muted small">{status}</p>}

      <p className="muted small">
        The sync file holds full cases, including dates and CSN - keep it in storage your institution covers, not a
        personal drive. Use <strong>Export de-identified</strong> for anything that needs to leave that perimeter.
      </p>
    </div>
  );
}
