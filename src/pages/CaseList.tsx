import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listCases, createCase, deleteCase, exportCases, importCases } from '../lib/db';
import type { PreopCase } from '../types';
import { resolveCaseProcedure } from '../lib/caseProcedure';
import { displayCaseLabel, formatWeekday } from '../lib/caseDate';
import { ensurePersistentStorage, formatBytes, type StorageStatus } from '../lib/storagePersistence';

export default function CaseList() {
  const [cases, setCases] = useState<PreopCase[]>([]);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [storage, setStorage] = useState<StorageStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    listCases().then(setCases);
    // Ask once per load; the browser remembers the grant.
    ensurePersistentStorage().then(setStorage);
  }, []);

  async function handleExport() {
    const json = await exportCases();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `preop-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setBackupMessage(`Exported ${cases.length} case${cases.length === 1 ? '' : 's'}.`);
  }

  async function handleImportFile(file: File) {
    try {
      const result = await importCases(await file.text());
      setCases(await listCases());
      setBackupMessage(`Restored: ${result.added} added, ${result.updated} updated, ${result.skipped} already current.`);
    } catch (error) {
      setBackupMessage(error instanceof Error ? error.message : 'Could not read that backup file.');
    }
  }

  async function handleCreate() {
    const c = await createCase();
    navigate(`/case/${c.id}`);
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Delete this case? This cannot be undone.')) return;
    await deleteCase(id);
    setCases(await listCases());
  }

  return (
    <div className="page">
      <h1>Preop Cases</h1>

      <button className="primary new-case-btn" onClick={handleCreate}>
        + Start new case
      </button>

      <div className="backup-bar">
        <button className="small" onClick={handleExport} disabled={cases.length === 0}>
          Export backup
        </button>
        <button className="small" onClick={() => fileInputRef.current?.click()}>
          Restore backup
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImportFile(file);
            e.target.value = '';
          }}
        />
      </div>
      {backupMessage && <p className="muted small">{backupMessage}</p>}

      {storage?.state === 'persisted' && (
        <p className="muted small">
          Cases save automatically and this device has granted persistent storage, so they won't be cleared to free up
          space{storage.usageBytes !== undefined ? ` (using ${formatBytes(storage.usageBytes)})` : ''}. Exporting is
          optional - worth doing before clearing Safari data or changing phones.
        </p>
      )}
      {storage?.state === 'best-effort' && (
        <p className="muted small">
          Cases save automatically, but this browser hasn't granted persistent storage, so it could clear them if the
          device runs low on space. Adding the app to your home screen usually earns persistence - until then, export a
          backup now and then.
        </p>
      )}
      <p className="muted small">
        Note that the home-screen app and Safari keep separate storage on iOS, so a case saved in one won't appear in
        the other.
      </p>

      <h2>Cases</h2>
      {cases.length === 0 && <p className="muted">No cases yet.</p>}
      <ul className="case-list">
        {cases.map((c) => {
          const procedure = resolveCaseProcedure(c);
          const dictatedProcedure = typeof c.values.plannedProcedure === 'string' ? c.values.plannedProcedure : '';
          return (
            <li key={c.id} className="case-row" onClick={() => navigate(`/case/${c.id}`)}>
              <div>
                <strong>{displayCaseLabel(c)}</strong>
                <div className="muted small">
                  {formatWeekday(c.caseDate)} - {procedure?.label || dictatedProcedure || 'No procedure yet'}
                </div>
              </div>
              <button className="danger small" onClick={(e) => handleDelete(c.id, e)}>
                Delete
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
