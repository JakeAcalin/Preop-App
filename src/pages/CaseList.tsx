import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listCases, createCase, deleteCase } from '../lib/db';
import type { PreopCase } from '../types';
import { resolveCaseProcedure } from '../lib/caseProcedure';

export default function CaseList() {
  const [cases, setCases] = useState<PreopCase[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    listCases().then(setCases);
  }, []);

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

      <h2>Cases</h2>
      {cases.length === 0 && <p className="muted">No cases yet.</p>}
      <ul className="case-list">
        {cases.map((c) => {
          const procedure = resolveCaseProcedure(c);
          const dictatedProcedure = typeof c.values.plannedProcedure === 'string' ? c.values.plannedProcedure : '';
          return (
            <li key={c.id} className="case-row" onClick={() => navigate(`/case/${c.id}`)}>
              <div>
                <strong>{c.patientLabel}</strong>
                <div className="muted small">
                  {procedure?.label || dictatedProcedure || 'No procedure yet'}
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
