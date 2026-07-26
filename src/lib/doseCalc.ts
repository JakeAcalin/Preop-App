import {
  findDrugEntry,
  type DoseUnit,
  type DoseVariant,
  type DrugEntry,
  type WeightBasis,
} from '../data/drugDoses';
import type { PatientWeights } from './weights';

export interface DoseLine {
  /** e.g. "RSI", "Bolus", "Infusion" - blank when the drug has one dose. */
  indication?: string;
  /** e.g. "96 mg", "50-100 mcg", "16-160 mcg/min". */
  dose: string;
  /** e.g. "1.2 mg/kg x 80 kg actual" - blank for fixed doses. */
  detail?: string;
  note?: string;
  capped?: boolean;
  /** True for the variant matching the dose written on the chip. */
  highlighted?: boolean;
}

export interface CalculatedDrug {
  /** The chip text this came from. */
  source: string;
  label: string;
  lines: DoseLine[];
}

interface PerKgDose {
  low: number;
  high?: number;
  unit: DoseUnit;
}

/**
 * Reads an explicit per-kg dose out of the selected text, e.g. "Propofol
 * 2mg/kg". When present it's calculated as its own line and the matching
 * reference variant is highlighted, so the number shown always matches the
 * label picked.
 */
export function parsePerKgDose(text: string): PerKgDose | undefined {
  const match = text
    .toLowerCase()
    .match(/(\d+(?:\.\d+)?)\s*(?:-|to)?\s*(\d+(?:\.\d+)?)?\s*(mcg|microgram|mg|g)\s*\/\s*kg(?!\s*\/)/);
  if (!match) return undefined;

  const low = Number(match[1]);
  if (!Number.isFinite(low)) return undefined;
  const high = match[2] !== undefined ? Number(match[2]) : undefined;
  const rawUnit = match[3];
  const unit: DoseUnit = rawUnit === 'microgram' ? 'mcg' : (rawUnit as DoseUnit);

  return { low, high, unit };
}

function weightFor(basis: WeightBasis | undefined, weights: PatientWeights): number | undefined {
  switch (basis) {
    case 'IBW':
      return weights.ibwKg;
    case 'LBW':
      return weights.lbwKg;
    case 'AdjBW':
      return weights.adjBwKg;
    case 'TBW':
    default:
      return weights.tbwKg;
  }
}

/** Rounds to an increment that's sensible to actually draw up. */
export function roundDose(value: number): number {
  if (value >= 100) return Math.round(value / 10) * 10;
  if (value >= 20) return Math.round(value / 5) * 5;
  if (value >= 1) return Math.round(value * 2) / 2;
  return Math.round(value * 100) / 100;
}

function formatRange(low: number, high: number | undefined, unit: string): string {
  const roundedLow = roundDose(low);
  const roundedHigh = high !== undefined ? roundDose(high) : undefined;
  return roundedHigh !== undefined && roundedHigh !== roundedLow
    ? `${roundedLow}-${roundedHigh} ${unit}`
    : `${roundedLow} ${unit}`;
}

const BASIS_LABEL: Record<WeightBasis, string> = {
  TBW: 'actual',
  IBW: 'IBW',
  LBW: 'LBW',
  AdjBW: 'AdjBW',
};

function perKgLine(
  variant: Extract<DoseVariant, { kind: 'perKg' }>,
  weights: PatientWeights,
): DoseLine | null {
  const basis = variant.basis ?? 'TBW';
  const kg = weightFor(basis, weights) ?? weights.tbwKg;
  if (kg === undefined) return null;

  const usedFallback = weightFor(basis, weights) === undefined;
  const cap = variant.maxDose;
  const rawLow = variant.low * kg;
  const rawHigh = variant.high !== undefined ? variant.high * kg : undefined;
  const capped = cap !== undefined && (rawLow > cap || (rawHigh !== undefined && rawHigh > cap));

  const low = cap !== undefined ? Math.min(rawLow, cap) : rawLow;
  const high = rawHigh !== undefined && cap !== undefined ? Math.min(rawHigh, cap) : rawHigh;

  const perKgText = variant.high !== undefined ? `${variant.low}-${variant.high}` : `${variant.low}`;
  const basisText = usedFallback
    ? `${Math.round(kg)} kg actual (${BASIS_LABEL[basis]} unavailable)`
    : `${Math.round(kg)} kg ${BASIS_LABEL[basis]}`;

  return {
    indication: variant.indication,
    dose: formatRange(low, high, variant.unit),
    detail: `${perKgText} ${variant.unit}/kg x ${basisText}`,
    note: variant.note,
    capped,
  };
}

function infusionLine(
  variant: Extract<DoseVariant, { kind: 'infusion' }>,
  weights: PatientWeights,
): DoseLine {
  const rate =
    variant.high !== undefined ? `${variant.low}-${variant.high} ${variant.unit}` : `${variant.low} ${variant.unit}`;

  // Weight-based rates get multiplied out into what actually runs.
  const kg = weights.tbwKg;
  let detail: string | undefined;
  if (kg !== undefined && variant.unit.startsWith('mcg/kg')) {
    const perMinute = variant.unit === 'mcg/kg/min';
    let low = variant.low * kg;
    let high = variant.high !== undefined ? variant.high * kg : undefined;
    let unit = perMinute ? 'mcg/min' : 'mcg/hr';

    // Thousands of mcg/min is nobody's mental model - propofol and the like
    // are set in mg/hr, so switch units once the number gets unwieldy.
    if (low >= 1000) {
      const toMgPerHour = perMinute ? 60 / 1000 : 1 / 1000;
      low *= toMgPerHour;
      if (high !== undefined) high *= toMgPerHour;
      unit = 'mg/hr';
    }

    detail = `= ${formatRange(low, high, unit)} at ${Math.round(kg)} kg`;
  }

  return { indication: variant.indication, dose: rate, detail, note: variant.note };
}

function bandedLine(
  variant: Extract<DoseVariant, { kind: 'banded' }>,
  weights: PatientWeights,
): DoseLine {
  const kg = weights.tbwKg;
  if (kg === undefined) {
    const summary = variant.bands
      .map((b) => (b.upToKg !== undefined ? `<=${b.upToKg} kg: ${b.dose}` : `>: ${b.dose}`))
      .join(', ');
    return { indication: variant.indication, dose: summary, note: variant.note };
  }

  const band = variant.bands.find((b) => b.upToKg === undefined || kg <= b.upToKg) ?? variant.bands[variant.bands.length - 1];
  return {
    indication: variant.indication,
    dose: band.dose,
    detail: `at ${Math.round(kg)} kg`,
    note: variant.note,
  };
}

function variantLine(variant: DoseVariant, weights: PatientWeights): DoseLine | null {
  switch (variant.kind) {
    case 'perKg':
      return perKgLine(variant, weights);
    case 'infusion':
      return infusionLine(variant, weights);
    case 'banded':
      return bandedLine(variant, weights);
    case 'fixed':
      return { indication: variant.indication, dose: variant.dose, note: variant.note };
  }
}

/**
 * Builds every dose line for one selected drug: the dose written on the chip
 * (if any) plus the reference variants for that drug, so picking
 * "Rocuronium" also surfaces the RSI and maintenance doses.
 */
function calculateDrug(source: string, weights: PatientWeights): CalculatedDrug | null {
  const entry: DrugEntry | undefined = findDrugEntry(source);
  if (!entry) return null;

  const explicit = parsePerKgDose(source);
  const lines: DoseLine[] = [];

  if (explicit && weights.tbwKg !== undefined) {
    // Match the reference variant so we can label the line meaningfully.
    const matching = entry.variants.find(
      (v) => v.kind === 'perKg' && v.low === explicit.low && (v.high ?? undefined) === (explicit.high ?? undefined),
    );
    const indication = matching && matching.kind === 'perKg' ? matching.indication : 'As selected';

    // Ceilings are a property of the drug, not of the dose written on the
    // chip, so apply them even to a hand-dictated rate.
    const cap =
      matching && matching.kind === 'perKg'
        ? matching.maxDose
        : entry.variants.find((v) => v.kind === 'perKg' && v.maxDose !== undefined)?.kind === 'perKg'
          ? (entry.variants.find((v) => v.kind === 'perKg' && v.maxDose !== undefined) as { maxDose?: number }).maxDose
          : undefined;

    const kg = weights.tbwKg;
    const rawLow = explicit.low * kg;
    const rawHigh = explicit.high !== undefined ? explicit.high * kg : undefined;
    const capped = cap !== undefined && (rawLow > cap || (rawHigh !== undefined && rawHigh > cap));
    const low = cap !== undefined ? Math.min(rawLow, cap) : rawLow;
    const high = rawHigh !== undefined && cap !== undefined ? Math.min(rawHigh, cap) : rawHigh;

    lines.push({
      indication,
      dose: formatRange(low, high, explicit.unit),
      detail: `${explicit.high !== undefined ? `${explicit.low}-${explicit.high}` : explicit.low} ${explicit.unit}/kg x ${Math.round(kg)} kg actual`,
      highlighted: true,
      capped,
    });
  }

  for (const variant of entry.variants) {
    // Skip the reference variant already shown as the selected dose.
    if (
      explicit &&
      variant.kind === 'perKg' &&
      variant.low === explicit.low &&
      (variant.high ?? undefined) === (explicit.high ?? undefined)
    ) {
      const line = perKgLine(variant, weights);
      if (line?.note) lines[0].note = line.note;
      if (line && line.detail !== lines[0].detail && variant.basis && variant.basis !== 'TBW') {
        lines[0].note = [`Conventionally dosed on ${BASIS_LABEL[variant.basis]} = ${line.dose}.`, line.note]
          .filter(Boolean)
          .join(' ');
      }
      continue;
    }
    const line = variantLine(variant, weights);
    if (line) lines.push(line);
  }

  if (lines.length === 0) return null;
  return { source, label: entry.label, lines };
}

/**
 * Calculates doses for every drug mentioned in the given field values.
 * Values that don't correspond to a known drug are ignored.
 */
export function calculateDoses(
  value: string | string[] | undefined,
  weights: PatientWeights,
): CalculatedDrug[] {
  if (value === undefined) return [];
  const entries = Array.isArray(value) ? value : [value];

  const results: CalculatedDrug[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    if (!entry.trim()) continue;
    // One chip can name more than one drug ("Neostigmine 0.05mg/kg +
    // Glycopyrrolate"); calculate each part so both get their own dosing.
    for (const part of entry.split(/\s*\+\s*/)) {
      if (!part.trim()) continue;
      const calculated = calculateDrug(part, weights);
      if (!calculated) continue;
      const key = `${calculated.label}-${calculated.lines[0]?.dose ?? ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push(calculated);
    }
  }
  return results;
}

export function hasAnyWeight(weights: PatientWeights): boolean {
  return weights.tbwKg !== undefined;
}
