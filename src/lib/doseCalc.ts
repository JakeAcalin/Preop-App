import { findDrugDose, findFixedDose, type DrugDose, type WeightBasis } from '../data/drugDoses';
import type { PatientWeights } from './weights';

export interface CalculatedDose {
  /** The chip text this came from. */
  source: string;
  label: string;
  /** e.g. "100 mg" or "75-125 mg", or a fixed-dose string. */
  dose: string;
  /** e.g. "2 mg/kg x 50 kg (actual)" - blank for fixed doses. */
  basis: string;
  /** Clinical note, including any conventional alternative dosing weight. */
  note?: string;
  capped?: boolean;
}

interface PerKgDose {
  low: number;
  high?: number;
  unit: 'mg' | 'mcg' | 'g';
}

/**
 * Reads an explicit per-kg dose out of the selected text, e.g. "Propofol
 * 2mg/kg" or "Fentanyl 1-2 mcg/kg". What you picked wins over the default in
 * the dosing table, so the number shown always matches the label you chose.
 */
export function parsePerKgDose(text: string): PerKgDose | undefined {
  const match = text
    .toLowerCase()
    .match(/(\d+(?:\.\d+)?)\s*(?:-|to)?\s*(\d+(?:\.\d+)?)?\s*(mcg|microgram|mg|g)\s*\/\s*kg/);
  if (!match) return undefined;

  const first = Number(match[1]);
  const second = match[2] !== undefined ? Number(match[2]) : undefined;
  if (!Number.isFinite(first)) return undefined;

  const rawUnit = match[3];
  const unit: 'mg' | 'mcg' | 'g' = rawUnit === 'microgram' ? 'mcg' : (rawUnit as 'mg' | 'mcg' | 'g');

  return { low: first, high: second, unit };
}

function weightFor(basis: WeightBasis, weights: PatientWeights): number | undefined {
  switch (basis) {
    case 'TBW':
      return weights.tbwKg;
    case 'IBW':
      return weights.ibwKg;
    case 'LBW':
      return weights.lbwKg;
    case 'AdjBW':
      return weights.adjBwKg;
  }
}

/** Rounds to an increment that's sensible to actually draw up. */
export function roundDose(value: number): number {
  if (value >= 100) return Math.round(value / 10) * 10;
  if (value >= 20) return Math.round(value / 5) * 5;
  if (value >= 1) return Math.round(value * 2) / 2;
  return Math.round(value * 100) / 100;
}

function formatDose(low: number, high: number | undefined, unit: string): string {
  const roundedLow = roundDose(low);
  const roundedHigh = high !== undefined ? roundDose(high) : undefined;
  return roundedHigh !== undefined && roundedHigh !== roundedLow
    ? `${roundedLow}-${roundedHigh} ${unit}`
    : `${roundedLow} ${unit}`;
}

const BASIS_LABEL: Record<WeightBasis, string> = {
  TBW: 'actual weight',
  IBW: 'ideal body weight',
  LBW: 'lean body weight',
  AdjBW: 'adjusted body weight',
};

/**
 * Builds the advisory note for drugs conventionally dosed on something other
 * than actual weight, including what the dose would be on that basis - shown
 * alongside, never substituted for the number you asked for.
 */
function alternativeBasisNote(
  entry: DrugDose | undefined,
  perKg: PerKgDose,
  weights: PatientWeights,
): string | undefined {
  if (!entry || entry.basis === 'TBW') return undefined;

  const altWeight = weightFor(entry.basis, weights);
  if (altWeight === undefined) {
    return `Conventionally dosed on ${BASIS_LABEL[entry.basis]} - enter height and sex to calculate that.`;
  }

  const altDose = formatDose(perKg.low * altWeight, perKg.high ? perKg.high * altWeight : undefined, perKg.unit);
  return `Conventionally dosed on ${BASIS_LABEL[entry.basis]} (${Math.round(altWeight)} kg) = ${altDose}.`;
}

function calculateOne(source: string, weights: PatientWeights): CalculatedDose | null {
  const entry = findDrugDose(source);

  // Prefer the dose written on the chip; fall back to the table's default.
  const perKg =
    parsePerKgDose(source) ??
    (entry && entry.perKg > 0 ? { low: entry.perKg, high: entry.perKgHigh, unit: entry.unit } : undefined);

  if (!perKg) {
    const fixed = findFixedDose(source);
    if (fixed) return { source, label: fixed.label, dose: fixed.dose, basis: '' };
    if (entry?.note) return { source, label: entry.label, dose: '-', basis: '', note: entry.note };
    return null;
  }

  const tbw = weights.tbwKg;
  if (tbw === undefined) return null;

  const cap = entry?.maxDose;
  const rawLow = perKg.low * tbw;
  const rawHigh = perKg.high !== undefined ? perKg.high * tbw : undefined;
  const wasCapped = cap !== undefined && (rawLow > cap || (rawHigh !== undefined && rawHigh > cap));

  const low = cap !== undefined ? Math.min(rawLow, cap) : rawLow;
  const high = rawHigh !== undefined && cap !== undefined ? Math.min(rawHigh, cap) : rawHigh;

  const perKgText = perKg.high !== undefined ? `${perKg.low}-${perKg.high}` : `${perKg.low}`;
  const notes = [alternativeBasisNote(entry, perKg, weights), entry?.note].filter(Boolean);

  return {
    source,
    label: entry?.label ?? source,
    dose: formatDose(low, high, perKg.unit),
    basis: `${perKgText} ${perKg.unit}/kg x ${Math.round(tbw)} kg actual`,
    note: notes.length > 0 ? notes.join(' ') : undefined,
    capped: wasCapped,
  };
}

/**
 * Calculates doses for every drug mentioned in the given field values.
 * Values that don't correspond to a known drug are ignored.
 */
export function calculateDoses(
  value: string | string[] | undefined,
  weights: PatientWeights,
): CalculatedDose[] {
  if (value === undefined) return [];
  const entries = Array.isArray(value) ? value : [value];

  const results: CalculatedDose[] = [];
  for (const entry of entries) {
    if (!entry.trim()) continue;
    const calculated = calculateOne(entry, weights);
    if (calculated) results.push(calculated);
  }
  return results;
}

export function hasAnyWeight(weights: PatientWeights): boolean {
  return weights.tbwKg !== undefined;
}
