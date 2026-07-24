import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listCases, newCase, saveCase, deleteCase } from '../lib/db';
import type { PreopCase } from '../types';
import { PROCEDURES } from '../data/procedures';

export default function CaseList() {
  const [cases, setCases] = useState<PreopCase[]>([]);
  const [patientLabel, setPatientLabel] = useState('');
  const [procedureType, setProcedureType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    listCases().then(setCases);
  }, []);

  async function handleCreate() {
    const c = newCase(patientLabel.trim() || 'New case', procedureType);
    await saveCase(c);
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

      <div className="card">
        <h2>New case</h2>
        <label>
          Patient label (e.g. room/initials - avoid full PHI if this device isn't secured)
          <input
            value={patientLabel}
            onChange={(e) => setPatientLabel(e.target.value)}
            placeholder="Rm 12 - JS"
          />
        </label>
        <label>
          Procedure type
          <select value={procedureType} onChange={(e) => setProcedureType(e.target.value)}>
            <option value="">Select / freetext later...</option>
            {PROCEDURES.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <button className="primary" onClick={handleCreate}>
          Start new case
        </button>
      </div>

      <h2>Existing cases</h2>
      {cases.length === 0 && <p className="muted">No cases yet.</p>}
      <ul className="case-list">
        {cases.map((c) => (
          <li key={c.id} className="case-row" onClick={() => navigate(`/case/${c.id}`)}>
            <div>
              <strong>{c.patientLabel}</strong>
              <div className="muted small">
                {PROCEDURES.find((p) => p.key === c.procedureType)?.label || c.procedureType || 'No procedure set'}
              </div>
            </div>
            <button className="danger small" onClick={(e) => handleDelete(c.id, e)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
