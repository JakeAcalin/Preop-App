import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCase, saveCase, nextCaseNumber } from '../lib/db';
import type { PreopCase } from '../types';
import { PROCEDURES } from '../data/procedures';
import { ROTATIONS } from '../data/rotations';
import {
  addDays,
  buildCaseLabel,
  defaultCaseDate,
  formatWeekday,
  nextMonday,
  toISODate,
} from '../lib/caseDate';
import ChecklistPanel from '../components/ChecklistPanel';
import SummaryPanel from '../components/SummaryPanel';

type Tab = 'checklist' | 'summary';

export default function CaseEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [preopCase, setPreopCase] = useState<PreopCase | null>(null);
  const [tab, setTab] = useState<Tab>('checklist');

  useEffect(() => {
    if (!id) return;
    getCase(id).then((c) => {
      if (!c) {
        navigate('/');
        return;
      }
      setPreopCase(c);
    });
  }, [id, navigate]);

  function updateCase(updater: (c: PreopCase) => PreopCase) {
    setPreopCase((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      saveCase(next);
      return next;
    });
  }

  // Moving a case to another day renumbers it against that day's cases.
  async function changeCaseDate(caseDate: string) {
    if (!caseDate || !preopCase) return;
    const caseNumber = await nextCaseNumber(caseDate, preopCase.id);
    updateCase((c) => ({ ...c, caseDate, caseNumber, updatedAt: Date.now() }));
  }

  if (!preopCase) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <button className="link-btn" onClick={() => navigate('/')}>
        {'←'} All cases
      </button>

      <div className="case-header card">
        <div className="case-title-row">
          <h2>{buildCaseLabel(preopCase.caseDate, preopCase.caseNumber)}</h2>
          <span className="muted small">{formatWeekday(preopCase.caseDate)}</span>
        </div>

        <label>
          Date of surgery
          <input type="date" value={preopCase.caseDate} onChange={(e) => changeCaseDate(e.target.value)} />
        </label>
        <div className="date-quick-set">
          <button className="small" onClick={() => changeCaseDate(defaultCaseDate())}>
            Tomorrow
          </button>
          <button className="small" onClick={() => changeCaseDate(toISODate(addDays(new Date(), 2)))}>
            +2 days
          </button>
          <button className="small" onClick={() => changeCaseDate(nextMonday())}>
            Next Monday
          </button>
        </div>

        <label>
          Rotation
          <select
            value={preopCase.rotation ?? ''}
            onChange={(e) => updateCase((c) => ({ ...c, rotation: e.target.value || undefined, updatedAt: Date.now() }))}
          >
            <option value="">Not set</option>
            {ROTATIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label>
          Label override (optional)
          <input
            placeholder="e.g. add room or service"
            value={preopCase.customLabel ?? ''}
            onChange={(e) =>
              updateCase((c) => ({ ...c, customLabel: e.target.value || undefined, updatedAt: Date.now() }))
            }
          />
        </label>

        <label>
          Procedure type (optional - otherwise matched from what you dictate)
          <select
            value={preopCase.procedureType}
            onChange={(e) => updateCase((c) => ({ ...c, procedureType: e.target.value, updatedAt: Date.now() }))}
          >
            <option value="">Auto-detect</option>
            {PROCEDURES.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav className="tabs">
        <button className={tab === 'checklist' ? 'tab active' : 'tab'} onClick={() => setTab('checklist')}>
          Checklist
        </button>
        <button className={tab === 'summary' ? 'tab active' : 'tab'} onClick={() => setTab('summary')}>
          Summary
        </button>
      </nav>

      {tab === 'checklist' && <ChecklistPanel preopCase={preopCase} onUpdateCase={updateCase} />}
      {tab === 'summary' && <SummaryPanel preopCase={preopCase} />}
    </div>
  );
}
