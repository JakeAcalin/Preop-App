import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCase, saveCase } from '../lib/db';
import type { PreopCase } from '../types';
import { PROCEDURES } from '../data/procedures';
import DictationPanel from '../components/DictationPanel';
import ChecklistPanel from '../components/ChecklistPanel';
import SummaryPanel from '../components/SummaryPanel';

type Tab = 'dictate' | 'checklist' | 'summary';

export default function CaseEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [preopCase, setPreopCase] = useState<PreopCase | null>(null);
  const [tab, setTab] = useState<Tab>('dictate');

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

  if (!preopCase) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <button className="link-btn" onClick={() => navigate('/')}>
        {'←'} All cases
      </button>

      <div className="case-header card">
        <label>
          Patient label
          <input
            value={preopCase.patientLabel}
            onChange={(e) => updateCase((c) => ({ ...c, patientLabel: e.target.value, updatedAt: Date.now() }))}
          />
        </label>
        <label>
          Procedure type
          <select
            value={preopCase.procedureType}
            onChange={(e) => updateCase((c) => ({ ...c, procedureType: e.target.value, updatedAt: Date.now() }))}
          >
            <option value="">Not set</option>
            {PROCEDURES.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav className="tabs">
        <button className={tab === 'dictate' ? 'tab active' : 'tab'} onClick={() => setTab('dictate')}>
          Dictate
        </button>
        <button className={tab === 'checklist' ? 'tab active' : 'tab'} onClick={() => setTab('checklist')}>
          Checklist
        </button>
        <button className={tab === 'summary' ? 'tab active' : 'tab'} onClick={() => setTab('summary')}>
          Summary
        </button>
      </nav>

      {tab === 'dictate' && <DictationPanel preopCase={preopCase} onUpdateCase={updateCase} />}
      {tab === 'checklist' && <ChecklistPanel preopCase={preopCase} onUpdateCase={updateCase} />}
      {tab === 'summary' && <SummaryPanel preopCase={preopCase} />}
    </div>
  );
}
