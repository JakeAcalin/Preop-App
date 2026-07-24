import { useMemo, useState } from 'react';
import type { PreopCase } from '../types';
import { FIELDS, SECTIONS } from '../data/fields';
import { appendToValue } from '../data/dictationRouter';
import FieldInput from './FieldInput';
import MicButton from './MicButton';

interface Props {
  preopCase: PreopCase;
  onUpdateCase: (updater: (c: PreopCase) => PreopCase) => void;
}

function isEmpty(value: string | string[] | undefined): boolean {
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  return value.trim().length === 0;
}

export default function ChecklistPanel({ preopCase, onUpdateCase }: Props) {
  const missingRequired = useMemo(
    () => FIELDS.filter((f) => f.required && isEmpty(preopCase.values[f.id])),
    [preopCase.values],
  );
  const [walkIndex, setWalkIndex] = useState(0);
  const [walking, setWalking] = useState(false);

  function setFieldValue(fieldId: string, value: string | string[]) {
    onUpdateCase((c) => ({ ...c, values: { ...c.values, [fieldId]: value }, updatedAt: Date.now() }));
  }

  function dictateIntoField(fieldId: string, text: string) {
    if (!text.trim()) return;
    onUpdateCase((c) => {
      const existing = c.values[fieldId];
      const merged = appendToValue(typeof existing === 'string' ? existing : '', text);
      return { ...c, values: { ...c.values, [fieldId]: merged }, updatedAt: Date.now() };
    });
  }

  const currentField = walking ? missingRequired[walkIndex] : undefined;

  return (
    <div className="checklist-panel">
      <div className="card">
        <h3>Required-field walkthrough</h3>
        {missingRequired.length === 0 ? (
          <p className="success">All required fields are filled in.</p>
        ) : !walking ? (
          <>
            <p className="muted">
              {missingRequired.length} required field{missingRequired.length === 1 ? '' : 's'} still missing.
            </p>
            <button className="primary" onClick={() => { setWalking(true); setWalkIndex(0); }}>
              Start walkthrough
            </button>
          </>
        ) : currentField ? (
          <div className="walkthrough-step">
            <p className="muted small">
              Missing field {walkIndex + 1} of {missingRequired.length}
            </p>
            <h4>{currentField.label}</h4>
            <FieldInput
              field={currentField}
              value={preopCase.values[currentField.id]}
              onChange={(v) => setFieldValue(currentField.id, v)}
            />
            <MicButton
              label={`Dictate: ${currentField.label}`}
              onTranscriptChange={() => {}}
              onStop={(text) => dictateIntoField(currentField.id, text)}
            />
            <div className="walkthrough-nav">
              <button
                disabled={walkIndex === 0}
                onClick={() => setWalkIndex((i) => Math.max(0, i - 1))}
              >
                Back
              </button>
              <button
                className="primary"
                onClick={() => {
                  if (walkIndex + 1 >= missingRequired.length) setWalking(false);
                  else setWalkIndex((i) => i + 1);
                }}
              >
                {walkIndex + 1 >= missingRequired.length ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        ) : (
          <p className="success">Walkthrough complete.</p>
        )}
      </div>

      <h3>All fields</h3>
      {SECTIONS.map((section) => (
        <div className="card" key={section.id}>
          <h4>{section.label}</h4>
          {FIELDS.filter((f) => f.section === section.id).map((field) => (
            <div className="field-row" key={field.id}>
              <label>
                {field.label}
                {field.required && isEmpty(preopCase.values[field.id]) && (
                  <span className="badge-missing">missing</span>
                )}
              </label>
              <FieldInput
                field={field}
                value={preopCase.values[field.id]}
                onChange={(v) => setFieldValue(field.id, v)}
              />
            </div>
          ))}
        </div>
      ))}

      {preopCase.unsorted.length > 0 && (
        <div className="card">
          <h4>Unsorted dictation</h4>
          <p className="muted small">Phrases from dictation that weren't auto-matched. Assign or discard them.</p>
          {preopCase.unsorted.map((note) => (
            <div className="unsorted-item" key={note.id}>
              <p>{note.text}</p>
              <div className="review-controls">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const fieldId = e.target.value;
                    if (!fieldId) return;
                    dictateIntoField(fieldId, note.text);
                    onUpdateCase((c) => ({ ...c, unsorted: c.unsorted.filter((n) => n.id !== note.id) }));
                  }}
                >
                  <option value="">Assign to field...</option>
                  {FIELDS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <button
                  className="small danger"
                  onClick={() =>
                    onUpdateCase((c) => ({ ...c, unsorted: c.unsorted.filter((n) => n.id !== note.id) }))
                  }
                >
                  Discard
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
