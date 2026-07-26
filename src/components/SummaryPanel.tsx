import { useState } from 'react';
import type { PreopCase } from '../types';
import { FIELDS, SECTIONS } from '../data/fields';
import { resolveCaseProcedure } from '../lib/caseProcedure';
import { displayCaseLabel, formatWeekday } from '../lib/caseDate';
import ProcedureNotes from './ProcedureNotes';

interface Props {
  preopCase: PreopCase;
}

function buildPlainTextSummary(preopCase: PreopCase, procedureLabel: string): string {
  const lines: string[] = [];
  lines.push(`Case: ${displayCaseLabel(preopCase)} (${formatWeekday(preopCase.caseDate)})`);
  lines.push(`Procedure: ${procedureLabel}`);
  lines.push('');
  for (const section of SECTIONS) {
    const fields = FIELDS.filter((f) => f.section === section.id);
    const filled = fields.filter((f) => {
      const v = preopCase.values[f.id];
      return v !== undefined && (Array.isArray(v) ? v.length > 0 : v.trim().length > 0);
    });
    if (filled.length === 0) continue;
    lines.push(`${section.label.toUpperCase()}`);
    for (const f of filled) {
      const v = preopCase.values[f.id];
      lines.push(`- ${f.label}: ${Array.isArray(v) ? v.join(', ') : v}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

export default function SummaryPanel({ preopCase }: Props) {
  const [copied, setCopied] = useState(false);
  const procedure = resolveCaseProcedure(preopCase);
  const dictatedProcedure = typeof preopCase.values.plannedProcedure === 'string' ? preopCase.values.plannedProcedure : '';
  const procedureLabel = procedure?.label || dictatedProcedure || 'Not set';

  async function handleCopy() {
    const text = buildPlainTextSummary(preopCase, procedureLabel);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="summary-panel">
      <div className="card">
        <div className="summary-header">
          <div>
            <h2>{displayCaseLabel(preopCase)}</h2>
            <p className="muted">{procedureLabel}</p>
          </div>
          <button className="primary" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy summary'}
          </button>
        </div>
      </div>

      {SECTIONS.map((section) => {
        const fields = FIELDS.filter((f) => f.section === section.id);
        const filled = fields.filter((f) => {
          const v = preopCase.values[f.id];
          return v !== undefined && (Array.isArray(v) ? v.length > 0 : v.trim().length > 0);
        });
        if (filled.length === 0) return null;
        return (
          <div className="card" key={section.id}>
            <h4>{section.label}</h4>
            <dl className="summary-dl">
              {filled.map((f) => {
                const v = preopCase.values[f.id];
                return (
                  <div className="summary-row" key={f.id}>
                    <dt>{f.label}</dt>
                    <dd>{Array.isArray(v) ? v.join(', ') : v}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        );
      })}

      {procedure && <ProcedureNotes procedure={procedure} inferred={!preopCase.procedureType} />}

      {preopCase.unsorted.length > 0 && (
        <div className="card warning-card">
          <h4>Unsorted notes ({preopCase.unsorted.length})</h4>
          <p className="muted small">Go to Checklist to assign these before presenting.</p>
        </div>
      )}
    </div>
  );
}
