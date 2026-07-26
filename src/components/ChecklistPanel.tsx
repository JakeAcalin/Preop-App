import { useCallback, useMemo, useRef, useState } from 'react';
import type { FieldDef, PreopCase } from '../types';
import { FIELDS, SECTIONS } from '../data/fields';
import { applyDictatedText } from '../data/dictationRouter';
import { correctMedicalText } from '../lib/textCorrection';
import { parseSpeech, type VoiceCommand } from '../lib/voiceCommands';
import { resolveCaseProcedure } from '../lib/caseProcedure';
import { useVoiceSession } from '../hooks/useVoiceSession';
import FieldInput from './FieldInput';
import ProcedureNotes from './ProcedureNotes';

interface Props {
  preopCase: PreopCase;
  onUpdateCase: (updater: (c: PreopCase) => PreopCase) => void;
}

function isEmpty(value: string | string[] | undefined): boolean {
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  return value.trim().length === 0;
}

function describeValue(value: string | string[] | undefined): string {
  if (isEmpty(value)) return 'empty';
  return Array.isArray(value) ? value.join(', ') : (value as string);
}

export default function ChecklistPanel({ preopCase, onUpdateCase }: Props) {
  const [guiding, setGuiding] = useState(false);
  const [index, setIndex] = useState(0);
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [unmatchedSelect, setUnmatchedSelect] = useState<string | null>(null);

  const guidedFields = useMemo(
    () => (onlyMissing ? FIELDS.filter((f) => f.required && isEmpty(preopCase.values[f.id])) : FIELDS),
    [onlyMissing, preopCase.values],
  );

  const missingRequiredCount = useMemo(
    () => FIELDS.filter((f) => f.required && isEmpty(preopCase.values[f.id])).length,
    [preopCase.values],
  );

  const procedure = useMemo(() => resolveCaseProcedure(preopCase), [preopCase]);
  const procedureInferred = !preopCase.procedureType && Boolean(procedure);

  // Voice handlers run inside a long-lived recognition callback, so they read
  // the current field/index through refs rather than stale closure values.
  const indexRef = useRef(index);
  indexRef.current = index;
  const guidedFieldsRef = useRef(guidedFields);
  guidedFieldsRef.current = guidedFields;

  function setFieldValue(fieldId: string, value: string | string[]) {
    onUpdateCase((c) => ({ ...c, values: { ...c.values, [fieldId]: value }, updatedAt: Date.now() }));
  }

  const enterTextIntoField = useCallback(
    (field: FieldDef, rawText: string): boolean => {
      const cleaned = correctMedicalText(rawText);
      if (!cleaned) return false;

      let applied = false;
      onUpdateCase((c) => {
        const result = applyDictatedText(field, c.values[field.id], cleaned);
        if (result.kind !== 'value') return c;
        applied = true;
        return { ...c, values: { ...c.values, [field.id]: result.value }, updatedAt: Date.now() };
      });

      if (applied) {
        setLastAction(`Added to ${field.label}: "${cleaned}"`);
        setUnmatchedSelect(null);
      } else {
        setUnmatchedSelect(`"${cleaned}" didn't match an option for ${field.label} - pick one below.`);
      }
      return applied;
    },
    [onUpdateCase],
  );

  const runCommand = useCallback((command: VoiceCommand) => {
    const fields = guidedFieldsRef.current;
    const current = indexRef.current;

    switch (command) {
      case 'next':
      case 'skip':
        if (current + 1 < fields.length) {
          setIndex(current + 1);
          setLastAction(command === 'skip' ? 'Skipped' : 'Next field');
        } else {
          setLastAction('End of list');
        }
        break;
      case 'back':
        if (current > 0) {
          setIndex(current - 1);
          setLastAction('Previous field');
        }
        break;
      case 'clear': {
        const field = fields[current];
        if (field) {
          setFieldValue(field.id, field.type === 'multiselect' ? [] : '');
          setLastAction(`Cleared ${field.label}`);
        }
        break;
      }
      case 'stop':
        stopVoice();
        setLastAction('Stopped listening');
        break;
      case 'finish':
        stopVoice();
        setGuiding(false);
        setLastAction('Finished walkthrough');
        break;
    }
    setUnmatchedSelect(null);
    // stopVoice is stable (from the hook) but declared below; referencing it
    // here is fine because the callback only runs after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFinalChunk = useCallback(
    (chunk: string) => {
      const { content, command } = parseSpeech(chunk);
      const field = guidedFieldsRef.current[indexRef.current];
      if (content && field) {
        enterTextIntoField(field, content);
      }
      if (command) runCommand(command);
    },
    [enterTextIntoField, runCommand],
  );

  const { supported, listening, interim, error, start, stop: stopVoice } = useVoiceSession({
    onFinalChunk: handleFinalChunk,
  });

  const currentField = guiding ? guidedFields[index] : undefined;

  function startGuided() {
    setGuiding(true);
    setIndex(0);
    setLastAction(null);
    setUnmatchedSelect(null);
  }

  function exitGuided() {
    stopVoice();
    setGuiding(false);
  }

  return (
    <div className="checklist-panel">
      <div className="card">
        <div className="checklist-header">
          <h3>Guided entry</h3>
          {missingRequiredCount > 0 ? (
            <span className="badge-missing">{missingRequiredCount} required missing</span>
          ) : (
            <span className="badge-ok">required complete</span>
          )}
        </div>

        {!guiding ? (
          <>
            <p className="muted small">
              Steps through each field so you can dictate hands-free. Say <strong>"next"</strong>, <strong>"back"</strong>,{' '}
              <strong>"skip"</strong>, <strong>"scratch that"</strong>, or <strong>"stop listening"</strong> to move
              around - you can tack a command onto the end of a sentence ("hypertension and diabetes, next").
            </p>
            <label className="checkbox-option">
              <input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} />
              Only walk through missing required fields
            </label>
            <button className="primary" onClick={startGuided} disabled={guidedFields.length === 0}>
              Start guided entry
            </button>
            {guidedFields.length === 0 && <p className="success">Nothing left to fill in.</p>}
          </>
        ) : currentField ? (
          <div className="walkthrough-step">
            <p className="muted small">
              Field {index + 1} of {guidedFields.length}
              {currentField.required ? ' - required' : ''}
            </p>
            <h4>{currentField.label}</h4>

            <FieldInput
              field={currentField}
              value={preopCase.values[currentField.id]}
              onChange={(v) => setFieldValue(currentField.id, v)}
            />

            <p className="muted small current-value">Current: {describeValue(preopCase.values[currentField.id])}</p>

            {!supported ? (
              <p className="warning">
                Speech recognition isn't supported in this browser - use Chrome or Safari, or type entries in directly.
              </p>
            ) : (
              <div className="mic-control">
                {!listening ? (
                  <button className="primary mic-btn" onClick={start}>
                    {'\u{1F3A4}'} Start hands-free dictation
                  </button>
                ) : (
                  <button className="danger mic-btn" onClick={stopVoice}>
                    {'⏹'} Stop listening
                  </button>
                )}
                {listening && <span className="listening-indicator">Listening...</span>}
              </div>
            )}

            {interim && <div className="live-transcript interim">{interim}</div>}
            {lastAction && <p className="muted small">{lastAction}</p>}
            {unmatchedSelect && <p className="warning small">{unmatchedSelect}</p>}
            {error && <p className="warning small">{error}</p>}

            <div className="walkthrough-nav">
              <button disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
                Back
              </button>
              <button
                className="primary"
                onClick={() => {
                  if (index + 1 >= guidedFields.length) exitGuided();
                  else setIndex((i) => i + 1);
                }}
              >
                {index + 1 >= guidedFields.length ? 'Finish' : 'Next'}
              </button>
              <button onClick={exitGuided}>Exit</button>
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

      {procedure && <ProcedureNotes procedure={procedure} inferred={procedureInferred} />}

      {preopCase.unsorted.length > 0 && (
        <div className="card">
          <h4>Unsorted notes</h4>
          <p className="muted small">Left over from earlier dictation. Assign or discard them.</p>
          {preopCase.unsorted.map((note) => (
            <div className="unsorted-item" key={note.id}>
              <p>{note.text}</p>
              <div className="review-controls">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const field = FIELDS.find((f) => f.id === e.target.value);
                    if (!field) return;
                    if (enterTextIntoField(field, note.text)) {
                      onUpdateCase((c) => ({ ...c, unsorted: c.unsorted.filter((n) => n.id !== note.id) }));
                    }
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
