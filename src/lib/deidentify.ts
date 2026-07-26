import type { FieldValues, PreopCase } from '../types';
import { FIELDS } from '../data/fields';

/**
 * De-identification for cases leaving the device.
 *
 * Follows HIPAA Safe Harbor as far as an app reasonably can: the fields that
 * hold identifiers are dropped outright, and dates are cut back to the year
 * (Safe Harbor permits no finer granularity - not month, not quarter). What
 * it cannot do is guarantee free text is clean, since anything can end up in
 * a dictated note, so the free-text scrub is best-effort and every change is
 * reported for you to check.
 */

/** Fields dropped entirely - they exist to identify the encounter. */
const DROPPED_FIELD_IDS = ['csn'];

export interface Redaction {
  /** Where it was found - a field label, or "Case label". */
  location: string;
  /** What kind of identifier it looked like. */
  kind: string;
  original: string;
}

interface ScrubPattern {
  kind: string;
  pattern: RegExp;
  replacement: string;
}

const SCRUB_PATTERNS: ScrubPattern[] = [
  { kind: 'email address', pattern: /\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, replacement: '[email removed]' },
  {
    kind: 'phone number',
    pattern: /\b(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
    replacement: '[phone removed]',
  },
  { kind: 'web address', pattern: /\bhttps?:\/\/\S+/gi, replacement: '[URL removed]' },
  // Bare domains too - a portal link is just as identifying without the scheme.
  {
    kind: 'web address',
    pattern: /\b[\w-]+(?:\.[\w-]+)*\.(?:com|org|net|edu|gov|io|health)\b(?:\/\S*)?/gi,
    replacement: '[URL removed]',
  },
  {
    kind: 'record number',
    pattern: /\b(?:mrn|csn|acct|account|record)\s*#?\s*[:=]?\s*\d+\b/gi,
    replacement: '[record number removed]',
  },
  // Provider names aren't patient identifiers under Safe Harbor, but they
  // narrow a case to a service and a week, so strip them anyway.
  { kind: 'clinician name', pattern: /\b(?:dr\.?|doctor)\s+[A-Z][a-z]+\b/gi, replacement: 'Dr. [name removed]' },
  // A long run of digits is most likely an identifier; lab values and doses
  // are short, so this errs toward leaving clinical numbers alone.
  { kind: 'long number', pattern: /\b\d{6,}\b/g, replacement: '[number removed]' },
];

function scrubText(text: string, location: string, redactions: Redaction[]): string {
  let result = text;
  for (const { kind, pattern, replacement } of SCRUB_PATTERNS) {
    result = result.replace(pattern, (match) => {
      redactions.push({ location, kind, original: match });
      return replacement;
    });
  }
  return result;
}

function scrubValues(values: FieldValues, redactions: Redaction[]): FieldValues {
  const out: FieldValues = {};

  for (const [fieldId, value] of Object.entries(values)) {
    if (DROPPED_FIELD_IDS.includes(fieldId)) {
      const shown = Array.isArray(value) ? value.join(', ') : value;
      if (shown?.trim()) {
        redactions.push({
          location: FIELDS.find((f) => f.id === fieldId)?.label ?? fieldId,
          kind: 'encounter identifier',
          original: shown,
        });
      }
      continue;
    }

    const label = FIELDS.find((f) => f.id === fieldId)?.label ?? fieldId;
    out[fieldId] = Array.isArray(value)
      ? value.map((v) => scrubText(v, label, redactions))
      : scrubText(value, label, redactions);
  }

  return out;
}

export interface DeidentifiedCase extends Omit<PreopCase, 'caseDate' | 'customLabel'> {
  /** Year only - Safe Harbor allows no finer date granularity. */
  caseYear: string;
}

export interface DeidentifyResult {
  cases: DeidentifiedCase[];
  redactions: Redaction[];
}

export function deidentifyCases(cases: PreopCase[]): DeidentifyResult {
  const redactions: Redaction[] = [];

  const deidentified = cases.map((preopCase) => {
    const { caseDate, customLabel, values, ...rest } = preopCase;

    if (customLabel?.trim()) {
      redactions.push({ location: 'Case label', kind: 'free-form label', original: customLabel });
    }

    return {
      ...rest,
      // The app-generated id is random and not derived from patient data, so
      // it can stay and keep merges working.
      caseYear: caseDate.slice(0, 4),
      values: scrubValues(values, redactions),
    };
  });

  return { cases: deidentified, redactions };
}

/** Label for a de-identified case: year and rotation instead of a date. */
export function deidentifiedLabel(preopCase: DeidentifiedCase): string {
  const parts = [preopCase.caseYear];
  if (preopCase.rotation) parts.push(preopCase.rotation);
  parts.push(`Case ${preopCase.caseNumber}`);
  return parts.join(' | ');
}
