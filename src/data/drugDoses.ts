// Drug dosing reference.
//
// Doses are taken from the Stanford CA-1 Tutorial Textbook (2021, 15th ed.,
// Department of Anesthesiology, Stanford University Medical Center) - the
// induction agent, NMBA, reversal, vasoactive and perioperative antibiotic
// tables - unless marked otherwise. Antibiotic dosing follows the 2017 SHC
// dosing/re-dosing guidelines reproduced there and is institution-specific;
// check it against your own hospital's guideline.
//
// These are reference starting doses, not a substitute for checking the drug
// or your attending's preference. Edit freely - this file is meant to be
// yours.

/** Which body weight a dose is conventionally calculated from. */
export type WeightBasis = 'TBW' | 'IBW' | 'LBW' | 'AdjBW';

export type DoseUnit = 'mg' | 'mcg' | 'g' | 'units';

export interface PerKgVariant {
  kind: 'perKg';
  /** e.g. "Intubating", "RSI", "Maintenance" - omitted for single-dose drugs. */
  indication?: string;
  low: number;
  high?: number;
  unit: DoseUnit;
  basis?: WeightBasis;
  maxDose?: number;
  note?: string;
}

export interface FixedVariant {
  kind: 'fixed';
  indication?: string;
  /** Presented as-is, e.g. "5-10 mg IV bolus". */
  dose: string;
  note?: string;
}

export interface BandedVariant {
  kind: 'banded';
  indication?: string;
  /** Bands are checked in order; the first whose ceiling isn't exceeded wins. */
  bands: { upToKg?: number; dose: string }[];
  note?: string;
}

export interface InfusionVariant {
  kind: 'infusion';
  indication?: string;
  low: number;
  high?: number;
  /** Weight-based rates are multiplied out; fixed rates are shown as-is. */
  unit: 'mcg/kg/min' | 'mcg/kg/hr' | 'units/min' | 'mg/kg/hr';
  note?: string;
}

export type DoseVariant = PerKgVariant | FixedVariant | BandedVariant | InfusionVariant;

export interface DrugEntry {
  /** Matched case-insensitively against the text of a selected chip. */
  match: string[];
  label: string;
  variants: DoseVariant[];
}

export const DRUG_ENTRIES: DrugEntry[] = [
  // ---------------- Induction agents ----------------
  {
    match: ['propofol'],
    label: 'Propofol',
    variants: [
      { kind: 'perKg', indication: 'Induction', low: 1.5, high: 2.5, unit: 'mg', basis: 'LBW',
        note: 'Lower in elderly; higher in children.' },
      { kind: 'infusion', indication: 'Hypnosis', low: 100, high: 200, unit: 'mcg/kg/min' },
      { kind: 'infusion', indication: 'Sedation', low: 25, high: 75, unit: 'mcg/kg/min' },
    ],
  },
  {
    match: ['etomidate'],
    label: 'Etomidate',
    variants: [
      { kind: 'perKg', indication: 'Induction', low: 0.2, high: 0.3, unit: 'mg', basis: 'LBW',
        note: 'Adrenocortical suppression 4-8 h even after one dose; increased PONV.' },
    ],
  },
  {
    match: ['ketamine'],
    label: 'Ketamine',
    variants: [
      { kind: 'perKg', indication: 'Induction', low: 1, high: 2, unit: 'mg', basis: 'LBW' },
    ],
  },
  {
    match: ['midazolam', 'versed'],
    label: 'Midazolam',
    variants: [
      { kind: 'perKg', indication: 'Premedication', low: 0.02, high: 0.04, unit: 'mg', basis: 'TBW',
        note: 'Typically 1-2 mg in adults.' },
      { kind: 'perKg', indication: 'Induction', low: 0.1, high: 0.2, unit: 'mg', basis: 'TBW' },
    ],
  },
  {
    match: ['dexmedetomidine', 'precedex'],
    label: 'Dexmedetomidine',
    variants: [
      { kind: 'perKg', indication: 'Load (over 10 min)', low: 0.5, high: 1, unit: 'mcg', basis: 'AdjBW' },
      { kind: 'infusion', indication: 'Maintenance', low: 0.4, high: 1.2, unit: 'mcg/kg/hr',
        note: 'Bradycardia, heart block, hypotension; reduce in hepatic impairment.' },
    ],
  },
  {
    match: ['thiopental'],
    label: 'Thiopental',
    variants: [
      { kind: 'perKg', indication: 'Induction (adult)', low: 3, high: 5, unit: 'mg', basis: 'LBW',
        note: 'Do NOT mix with rocuronium - precipitates.' },
    ],
  },

  // ---------------- Neuromuscular blockers ----------------
  {
    match: ['succinylcholine', 'sux'],
    label: 'Succinylcholine',
    variants: [
      { kind: 'perKg', indication: 'Intubating', low: 1, high: 1.5, unit: 'mg', basis: 'TBW',
        note: 'Dosed on actual body weight. Onset 1-1.5 min, duration 6-8 min.' },
      { kind: 'perKg', indication: 'After defasciculating dose', low: 1.5, high: 2, unit: 'mg', basis: 'TBW' },
    ],
  },
  {
    match: ['rocuronium', 'roc'],
    label: 'Rocuronium',
    variants: [
      { kind: 'perKg', indication: 'Intubating', low: 0.6, unit: 'mg', basis: 'IBW',
        note: 'Onset 1.5-2 min, duration 30-40 min.' },
      { kind: 'perKg', indication: 'RSI', low: 1.2, unit: 'mg', basis: 'IBW',
        note: 'Onset ~1 min, duration >60 min.' },
      { kind: 'perKg', indication: 'Maintenance', low: 0.1, high: 0.2, unit: 'mg', basis: 'IBW' },
      { kind: 'perKg', indication: 'Defasciculating', low: 0.03, unit: 'mg', basis: 'IBW' },
    ],
  },
  {
    match: ['vecuronium'],
    label: 'Vecuronium',
    variants: [
      { kind: 'perKg', indication: 'Intubating', low: 0.1, high: 0.2, unit: 'mg', basis: 'IBW',
        note: 'Onset 3-4 min, duration 35-45 min. Active metabolite accumulates in renal failure.' },
      { kind: 'perKg', indication: 'Maintenance', low: 0.01, high: 0.02, unit: 'mg', basis: 'IBW' },
    ],
  },
  {
    match: ['cisatracurium'],
    label: 'Cisatracurium',
    variants: [
      { kind: 'perKg', indication: 'Intubating', low: 0.15, high: 0.2, unit: 'mg', basis: 'IBW',
        note: 'Onset 5-7 min, duration 35-45 min. Hofmann elimination - useful in renal/hepatic failure. Confirm maintenance dosing with your attending.' },
    ],
  },

  // ---------------- Reversal ----------------
  {
    match: ['sugammadex'],
    label: 'Sugammadex',
    variants: [
      { kind: 'perKg', indication: 'Standard reversal (TOF 1-2 twitches)', low: 2, unit: 'mg', basis: 'TBW' },
      { kind: 'perKg', indication: 'Deep reversal (1 twitch / PTC >=2)', low: 4, unit: 'mg', basis: 'TBW' },
      { kind: 'perKg', indication: 'Cannot intubate, cannot ventilate', low: 16, unit: 'mg', basis: 'TBW',
        note: 'Precipitates with ondansetron, verapamil, ranitidine. Hormonal contraception unreliable for 7 days.' },
    ],
  },
  {
    match: ['neostigmine'],
    label: 'Neostigmine',
    variants: [
      { kind: 'perKg', indication: 'Standard reversal', low: 0.04, high: 0.05, unit: 'mg', basis: 'TBW', maxDose: 5,
        note: 'Ceiling effect - do not exceed 70 mcg/kg. Give with glycopyrrolate at 1/5 the neostigmine dose.' },
      { kind: 'perKg', indication: 'Near-full recovery (4 equal twitches)', low: 0.015, high: 0.02, unit: 'mg', basis: 'TBW' },
    ],
  },
  {
    match: ['glycopyrrolate', 'robinul'],
    label: 'Glycopyrrolate',
    variants: [
      { kind: 'fixed', indication: 'With neostigmine', dose: '1/5 of neostigmine dose',
        note: 'e.g. 0.6 mg glycopyrrolate with 3 mg neostigmine.' },
      { kind: 'fixed', indication: 'Antisialagogue', dose: '0.2 mg IV' },
    ],
  },
  {
    match: ['atropine'],
    label: 'Atropine',
    variants: [{ kind: 'fixed', indication: 'Bradycardia', dose: '0.5 mg IV, repeat to 3 mg max' }],
  },
  {
    match: ['flumazenil'],
    label: 'Flumazenil',
    variants: [
      { kind: 'fixed', dose: '0.2 mg IV, repeat to 1-3 mg',
        note: 'Shorter-acting than the benzodiazepine - watch 2-3 h for re-sedation.' },
    ],
  },

  // ---------------- Vasoactives ----------------
  {
    match: ['phenylephrine'],
    label: 'Phenylephrine',
    variants: [
      { kind: 'fixed', indication: 'Bolus', dose: '50-100 mcg',
        note: 'Onset <1 min, duration 10-15 min.' },
      { kind: 'infusion', indication: 'Infusion', low: 0.2, high: 2, unit: 'mcg/kg/min' },
    ],
  },
  {
    match: ['ephedrine'],
    label: 'Ephedrine',
    variants: [
      { kind: 'fixed', indication: 'Bolus', dose: '5-10 mg',
        note: 'Onset 1-2 min, duration ~60 min. No infusion.' },
    ],
  },
  {
    match: ['norepinephrine', 'levophed'],
    label: 'Norepinephrine',
    variants: [
      { kind: 'fixed', indication: 'Bolus', dose: '5-10 mcg' },
      { kind: 'infusion', indication: 'Infusion', low: 0.02, high: 0.3, unit: 'mcg/kg/min' },
    ],
  },
  {
    match: ['epinephrine'],
    label: 'Epinephrine',
    variants: [
      { kind: 'fixed', indication: 'Bolus', dose: '5-10 mcg' },
      { kind: 'infusion', indication: 'Infusion', low: 0.02, high: 0.3, unit: 'mcg/kg/min' },
    ],
  },
  {
    match: ['vasopressin'],
    label: 'Vasopressin',
    variants: [
      { kind: 'fixed', indication: 'Bolus', dose: '0.5-1 unit',
        note: 'Duration 30-60 min.' },
      { kind: 'infusion', indication: 'Infusion', low: 0.01, high: 0.04, unit: 'units/min' },
    ],
  },
  {
    match: ['labetalol'],
    label: 'Labetalol',
    variants: [{ kind: 'fixed', indication: 'Bolus', dose: '5-10 mg IV, titrate' }],
  },
  {
    match: ['hydralazine'],
    label: 'Hydralazine',
    variants: [{ kind: 'fixed', indication: 'Bolus', dose: '5-10 mg IV' }],
  },
  {
    match: ['esmolol'],
    label: 'Esmolol',
    variants: [
      { kind: 'fixed', indication: 'Bolus', dose: '10-50 mg IV' },
      { kind: 'infusion', indication: 'Infusion', low: 50, high: 200, unit: 'mcg/kg/min' },
    ],
  },
  {
    match: ['nicardipine'],
    label: 'Nicardipine',
    variants: [{ kind: 'fixed', indication: 'Infusion', dose: '5-15 mg/hr' }],
  },

  // ---------------- Opioids / analgesia ----------------
  {
    match: ['fentanyl'],
    label: 'Fentanyl',
    variants: [
      { kind: 'perKg', indication: 'Bolus', low: 1, high: 2, unit: 'mcg', basis: 'LBW' },
    ],
  },
  {
    match: ['hydromorphone', 'dilaudid'],
    label: 'Hydromorphone',
    variants: [{ kind: 'fixed', indication: 'Bolus', dose: '0.2-0.5 mg IV, titrate' }],
  },
  {
    match: ['morphine'],
    label: 'Morphine',
    variants: [{ kind: 'fixed', indication: 'Bolus', dose: '2-4 mg IV, titrate' }],
  },
  {
    match: ['remifentanil'],
    label: 'Remifentanil',
    variants: [{ kind: 'infusion', indication: 'Infusion', low: 0.05, high: 0.2, unit: 'mcg/kg/min' }],
  },
  {
    match: ['ketorolac', 'toradol'],
    label: 'Ketorolac',
    variants: [
      { kind: 'fixed', dose: '15-30 mg IV',
        note: 'Reduce to 15 mg in elderly/renal impairment/low body weight.' },
    ],
  },
  {
    match: ['acetaminophen', 'tylenol'],
    label: 'Acetaminophen IV',
    variants: [
      { kind: 'perKg', low: 15, unit: 'mg', basis: 'TBW', maxDose: 1000,
        note: 'Max 1 g per dose, 4 g/day.' },
    ],
  },
  {
    match: ['lidocaine'],
    label: 'Lidocaine',
    variants: [{ kind: 'perKg', indication: 'IV bolus', low: 1, high: 1.5, unit: 'mg', basis: 'TBW' }],
  },

  // ---------------- Antiemetics ----------------
  {
    match: ['ondansetron', 'zofran'],
    label: 'Ondansetron',
    variants: [{ kind: 'fixed', dose: '4 mg IV', note: 'Precipitates with sugammadex.' }],
  },
  {
    match: ['dexamethasone', 'decadron'],
    label: 'Dexamethasone',
    variants: [{ kind: 'fixed', dose: '4-8 mg IV', note: 'Give after induction; watch glucose in diabetics.' }],
  },
  {
    match: ['metoclopramide', 'reglan'],
    label: 'Metoclopramide',
    variants: [{ kind: 'fixed', dose: '10 mg IV' }],
  },
  {
    match: ['scopolamine'],
    label: 'Scopolamine',
    variants: [{ kind: 'fixed', dose: '1.5 mg transdermal patch', note: 'Avoid in elderly - delirium risk.' }],
  },

  // ---------------- Antibiotics (2017 SHC guidelines) ----------------
  {
    match: ['cefazolin', 'ancef'],
    label: 'Cefazolin',
    variants: [
      {
        kind: 'banded',
        bands: [
          { upToKg: 120, dose: '2 g' },
          { dose: '3 g' },
        ],
        note: 'Re-dose q4h. Peds 30 mg/kg (max 2 g). Can bolus over 3 min.',
      },
    ],
  },
  {
    match: ['vancomycin', 'vanco'],
    label: 'Vancomycin',
    variants: [
      {
        kind: 'banded',
        bands: [
          { upToKg: 80, dose: '1 g' },
          { upToKg: 99, dose: '1.25 g' },
          { upToKg: 120, dose: '1.5 g' },
          { dose: '2 g' },
        ],
        note: 'Re-dose q12h. Infuse over 30-60 min (or <10 mg/min). Can start 60-120 min before incision.',
      },
    ],
  },
  {
    match: ['clindamycin', 'clinda'],
    label: 'Clindamycin',
    variants: [{ kind: 'fixed', dose: '900 mg', note: 'Re-dose q6h. Give over 30 min.' }],
  },
  {
    match: ['gentamicin'],
    label: 'Gentamicin',
    variants: [
      { kind: 'perKg', low: 5, unit: 'mg', basis: 'AdjBW',
        note: 'Single dose; 2 mg/kg if CrCl <20. Infuse over 30-120 min - oto/nephrotoxicity with bolus.' },
    ],
  },
  {
    match: ['ampicillin-sulbactam', 'unasyn'],
    label: 'Ampicillin-Sulbactam',
    variants: [{ kind: 'fixed', dose: '3 g', note: 'Re-dose q2h. Give over 15-30 min.' }],
  },
  {
    match: ['cefoxitin'],
    label: 'Cefoxitin',
    variants: [{ kind: 'fixed', dose: '2 g', note: 'Re-dose q2h.' }],
  },
  {
    match: ['ceftriaxone'],
    label: 'Ceftriaxone',
    variants: [{ kind: 'fixed', dose: '2 g', note: 'Re-dose q24h.' }],
  },
  {
    match: ['ertapenem'],
    label: 'Ertapenem',
    variants: [{ kind: 'fixed', dose: '1 g', note: 'Re-dose q24h. Give over 30 min.' }],
  },
  {
    match: ['metronidazole', 'flagyl'],
    label: 'Metronidazole',
    variants: [{ kind: 'fixed', dose: '500 mg', note: 'Re-dose q12h. Give over 20-60 min.' }],
  },
  {
    match: ['levofloxacin'],
    label: 'Levofloxacin',
    variants: [{ kind: 'fixed', dose: '500 mg', note: 'Re-dose q24h.' }],
  },
  {
    match: ['ciprofloxacin'],
    label: 'Ciprofloxacin',
    variants: [{ kind: 'fixed', dose: '400 mg', note: 'Re-dose q8h. Over 60 min. Contraindicated in pregnancy.' }],
  },
  {
    match: ['aztreonam'],
    label: 'Aztreonam',
    variants: [{ kind: 'fixed', dose: '2 g', note: 'Re-dose q4h.' }],
  },

  // ---------------- Hemostasis ----------------
  {
    match: ['tranexamic', 'txa'],
    label: 'Tranexamic acid',
    variants: [
      { kind: 'perKg', indication: 'Load', low: 10, high: 15, unit: 'mg', basis: 'TBW',
        note: 'Protocols vary widely by service - check yours.' },
    ],
  },
  {
    match: ['protamine'],
    label: 'Protamine',
    variants: [
      { kind: 'fixed', dose: '1 mg per 100 units heparin',
        note: 'Give slowly - rapid administration causes hypotension, pulmonary hypertension, anaphylactoid reactions.' },
    ],
  },
];

export function findDrugEntry(text: string): DrugEntry | undefined {
  const lower = text.toLowerCase();
  // Prefer the longest match so "norepinephrine" doesn't match "epinephrine".
  let best: DrugEntry | undefined;
  let bestLength = 0;
  for (const entry of DRUG_ENTRIES) {
    for (const m of entry.match) {
      if (lower.includes(m) && m.length > bestLength) {
        best = entry;
        bestLength = m.length;
      }
    }
  }
  return best;
}

export const DOSE_SOURCE = 'Stanford CA-1 Tutorial Textbook (2021, 15th ed.); antibiotics per 2017 SHC guidelines.';
