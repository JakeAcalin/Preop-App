// Weight-based dosing used to turn a selected drug into an actual dose for
// this patient (e.g. "Propofol 2 mg/kg" at 50 kg -> "100 mg").
//
// These are YOUR presets to review and adjust - typical adult starting doses,
// not a formulary or a substitute for checking the drug and your institution's
// protocol. The dosing weight matters as much as the number: several of these
// are conventionally dosed on lean or ideal body weight rather than actual
// weight, and that basis is shown next to every calculated dose.

/** Which body weight the dose is calculated from. */
export type WeightBasis = 'TBW' | 'IBW' | 'LBW' | 'AdjBW';

export interface DrugDose {
  /** Matched case-insensitively against the text of a selected chip. */
  match: string[];
  label: string;
  unit: 'mg' | 'mcg' | 'g';
  /** Dose per kg; `perKgHigh` set when the usual dose is a range. */
  perKg: number;
  perKgHigh?: number;
  basis: WeightBasis;
  /** Absolute cap regardless of weight (e.g. neostigmine 5 mg). */
  maxDose?: number;
  note?: string;
}

export const DRUG_DOSES: DrugDose[] = [
  // --- Induction ---
  {
    match: ['propofol'],
    label: 'Propofol (induction)',
    unit: 'mg',
    perKg: 1.5,
    perKgHigh: 2.5,
    basis: 'LBW',
    note: 'Induction conventionally dosed on lean body weight; titrate down in elderly/frail or unstable patients.',
  },
  {
    match: ['etomidate'],
    label: 'Etomidate',
    unit: 'mg',
    perKg: 0.2,
    perKgHigh: 0.3,
    basis: 'LBW',
  },
  {
    match: ['ketamine'],
    label: 'Ketamine (induction)',
    unit: 'mg',
    perKg: 1,
    perKgHigh: 2,
    basis: 'LBW',
  },
  {
    match: ['midazolam', 'versed'],
    label: 'Midazolam',
    unit: 'mg',
    perKg: 0.02,
    perKgHigh: 0.03,
    basis: 'TBW',
    maxDose: 2,
    note: 'Commonly given as a fixed 1-2 mg premedication dose in adults.',
  },
  {
    match: ['lidocaine'],
    label: 'Lidocaine',
    unit: 'mg',
    perKg: 1,
    perKgHigh: 1.5,
    basis: 'TBW',
  },
  {
    match: ['fentanyl'],
    label: 'Fentanyl',
    unit: 'mcg',
    perKg: 1,
    perKgHigh: 2,
    basis: 'LBW',
  },

  // --- Neuromuscular blockade / reversal ---
  {
    match: ['rocuronium'],
    label: 'Rocuronium',
    unit: 'mg',
    perKg: 0.6,
    basis: 'IBW',
    note: 'IBW for intubating dose; 1.2 mg/kg if RSI.',
  },
  {
    match: ['vecuronium'],
    label: 'Vecuronium',
    unit: 'mg',
    perKg: 0.1,
    basis: 'IBW',
  },
  {
    match: ['cisatracurium'],
    label: 'Cisatracurium',
    unit: 'mg',
    perKg: 0.15,
    basis: 'IBW',
  },
  {
    match: ['succinylcholine'],
    label: 'Succinylcholine',
    unit: 'mg',
    perKg: 1,
    perKgHigh: 1.5,
    basis: 'TBW',
    note: 'Dosed on actual body weight.',
  },
  {
    match: ['sugammadex'],
    label: 'Sugammadex',
    unit: 'mg',
    perKg: 2,
    basis: 'TBW',
    note: '2 mg/kg at TOF >=2; 4 mg/kg for deep block; 16 mg/kg for immediate reversal.',
  },
  {
    match: ['neostigmine'],
    label: 'Neostigmine',
    unit: 'mg',
    perKg: 0.05,
    basis: 'TBW',
    maxDose: 5,
    note: 'Give with glycopyrrolate; capped at 5 mg.',
  },

  // --- Analgesia / adjuncts ---
  {
    match: ['hydromorphone', 'dilaudid'],
    label: 'Hydromorphone',
    unit: 'mg',
    perKg: 0.01,
    perKgHigh: 0.02,
    basis: 'LBW',
  },
  {
    match: ['ketorolac', 'toradol'],
    label: 'Ketorolac',
    unit: 'mg',
    perKg: 0.5,
    basis: 'TBW',
    maxDose: 30,
  },
  {
    match: ['acetaminophen', 'tylenol'],
    label: 'Acetaminophen IV',
    unit: 'mg',
    perKg: 15,
    basis: 'TBW',
    maxDose: 1000,
  },
  {
    match: ['dexmedetomidine', 'precedex'],
    label: 'Dexmedetomidine (load)',
    unit: 'mcg',
    perKg: 1,
    basis: 'AdjBW',
    note: 'Load over 10 min; often reduced or omitted to avoid bradycardia/hypotension.',
  },

  // --- Hemostasis / antibiotics ---
  {
    match: ['tranexamic', 'txa'],
    label: 'Tranexamic acid',
    unit: 'mg',
    perKg: 15,
    basis: 'TBW',
    note: 'Institution protocols vary widely - check yours.',
  },
  {
    match: ['cefazolin', 'ancef'],
    label: 'Cefazolin',
    unit: 'g',
    perKg: 0,
    basis: 'TBW',
    note: 'Weight-banded, not per kg: 2 g, or 3 g if >=120 kg. Redose q4h.',
  },
];

/** Doses that are effectively fixed in adults - shown so they aren't mistaken for missing. */
export const FIXED_DOSE_NOTES: { match: string[]; label: string; dose: string }[] = [
  { match: ['ondansetron', 'zofran'], label: 'Ondansetron', dose: '4 mg IV' },
  { match: ['dexamethasone', 'decadron'], label: 'Dexamethasone', dose: '4-8 mg IV' },
  { match: ['glycopyrrolate', 'robinul'], label: 'Glycopyrrolate', dose: '0.2 mg per 1 mg neostigmine' },
  { match: ['phenylephrine'], label: 'Phenylephrine', dose: '50-100 mcg bolus' },
  { match: ['ephedrine'], label: 'Ephedrine', dose: '5-10 mg bolus' },
  { match: ['labetalol'], label: 'Labetalol', dose: '5-10 mg bolus' },
  { match: ['hydralazine'], label: 'Hydralazine', dose: '5-10 mg bolus' },
  { match: ['metoclopramide', 'reglan'], label: 'Metoclopramide', dose: '10 mg IV' },
];

export function findDrugDose(text: string): DrugDose | undefined {
  const lower = text.toLowerCase();
  return DRUG_DOSES.find((d) => d.match.some((m) => lower.includes(m)));
}

export function findFixedDose(text: string) {
  const lower = text.toLowerCase();
  return FIXED_DOSE_NOTES.find((d) => d.match.some((m) => lower.includes(m)));
}
