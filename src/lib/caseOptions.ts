import { FIELDS } from '../data/fields';
import type { FieldDef, FieldValues } from '../types';

/** Fields whose selections could plausibly be running as an infusion. */
const INFUSION_SOURCE_FIELDS = [
  'pressors',
  'antihypertensives',
  'sedation',
  'maintenance',
  'intraopAnalgesia',
  'induction',
  'hemostasis',
];

function looksLikeInfusion(value: string): boolean {
  return /gtt|infusion|\/min|\/hr|drip|tiva/i.test(value);
}

/** Everything selected in this case that reads like a running infusion. */
export function caseInfusions(values: FieldValues): string[] {
  const found: string[] = [];
  for (const fieldId of INFUSION_SOURCE_FIELDS) {
    const value = values[fieldId];
    if (value === undefined) continue;
    for (const entry of Array.isArray(value) ? value : [value]) {
      if (looksLikeInfusion(entry) && !found.includes(entry)) found.push(entry);
    }
  }
  return found;
}

/**
 * The options to offer for a field in the context of this case - normally
 * just the static list, plus the case's own infusions where the field asks
 * for them (On Pump).
 */
export function optionsForField(field: FieldDef, values: FieldValues): string[] {
  const base = field.options ?? [];
  if (!field.includeCaseInfusions) return base;

  const extra = caseInfusions(values).filter((i) => !base.includes(i));
  return [...base, ...extra];
}

export function fieldById(id: string): FieldDef | undefined {
  return FIELDS.find((f) => f.id === id);
}
