import { useState } from 'react';
import type { PreopCase } from '../types';
import { FIELDS, SECTIONS } from '../data/fields';
import { resolveCaseProcedure } from '../lib/caseProcedure';
import { displayCaseLabel, formatWeekday } from '../lib/caseDate';
import { derivePatientWeights, type PatientWeights } from '../lib/weights';
import { calculateDoses } from '../lib/doseCalc';
import ProcedureNotes from './ProcedureNotes';
import DoseHints from './DoseHints';

interface Props {
  preopCase: PreopCase;
}

function buildPlainTextSummary(
  preopCase: PreopCase,
  procedureLabel: string,
  weights: PatientWeights,
): string {
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
      const value = Array.isArray(v) ? v.join(', ') : v;
      // Only the selected/primary dose goes in the copyable text - the full
      // variant list is reference material for the screen, not the handoff.
      const doses = calculateDoses(v, weights)
        .map((drug) => {
          const primary = drug.lines.find((l) => l.highlighted) ?? drug.lines[0];
          return primary ? `${drug.label} ${primary.dose}` : null;
        })
        .filter(Boolean);
      lines.push(`- ${f.label}: ${value}${doses.length > 0 ? ` [${doses.join('; ')}]` : ''}`);
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

  const weights = derivePatientWeights(preopCase.values);

  async function handleCopy() {
    const text = buildPlainTextSummary(preopCase, procedureLabel, weights);
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
                const doses = calculateDoses(v, weights);
                return (
                  <div className="summary-row" key={f.id}>
                    <dt>{f.label}</dt>
                    <dd>
                      {Array.isArray(v) ? v.join(', ') : v}
                      <DoseHints drugs={doses} />
                    </dd>
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
