export type Sex = 'M' | 'F';

export interface PatientWeights {
  tbwKg?: number;
  heightCm?: number;
  sex?: Sex;
  ibwKg?: number;
  lbwKg?: number;
  adjBwKg?: number;
  bmi?: number;
}

const LB_PER_KG = 2.2046226218;
const CM_PER_INCH = 2.54;

/** Accepts "70", "70 kg", "154 lb", "154 lbs", "154#". */
export function parseWeightKg(raw: string | string[] | undefined): number | undefined {
  if (typeof raw !== 'string') return undefined;
  const text = raw.toLowerCase();
  const match = text.match(/(\d+(?:\.\d+)?)/);
  if (!match) return undefined;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  const isPounds = /\b(lb|lbs|pound)/.test(text) || text.includes('#');
  return isPounds ? value / LB_PER_KG : value;
}

/** Accepts "170", "170 cm", "5'8", "5 ft 8 in", "68 in", "68 inches". */
export function parseHeightCm(raw: string | string[] | undefined): number | undefined {
  if (typeof raw !== 'string') return undefined;
  const text = raw.toLowerCase().trim();

  const feetInches = text.match(/(\d+)\s*(?:'|ft|feet)\s*(\d+(?:\.\d+)?)?/);
  if (feetInches) {
    const feet = Number(feetInches[1]);
    const inches = Number(feetInches[2] ?? 0);
    return (feet * 12 + inches) * CM_PER_INCH;
  }

  const match = text.match(/(\d+(?:\.\d+)?)/);
  if (!match) return undefined;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return undefined;

  if (/\b(in|inch|inches|")/.test(text)) return value * CM_PER_INCH;
  return value; // assume cm
}

/** Pulls sex out of free-text demographics like "68F", "68 y/o female". */
export function parseSex(raw: string | string[] | undefined): Sex | undefined {
  if (typeof raw !== 'string') return undefined;
  const text = raw.toLowerCase();
  if (/\bfemale\b|\bwoman\b|\d\s*f\b|\bf\b/.test(text)) return 'F';
  if (/\bmale\b|\bman\b|\d\s*m\b|\bm\b/.test(text)) return 'M';
  return undefined;
}

/** Devine ideal body weight. */
export function calcIBW(heightCm: number, sex: Sex): number {
  const inchesOver5ft = Math.max(0, heightCm / CM_PER_INCH - 60);
  const base = sex === 'M' ? 50 : 45.5;
  return base + 2.3 * inchesOver5ft;
}

/** Janmahasatian lean body weight - uses BMI, so needs both height and weight. */
export function calcLBW(tbwKg: number, heightCm: number, sex: Sex): number {
  const bmi = calcBMI(tbwKg, heightCm);
  return sex === 'M'
    ? (9270 * tbwKg) / (6680 + 216 * bmi)
    : (9270 * tbwKg) / (8780 + 244 * bmi);
}

/** Adjusted body weight: IBW + 0.4 x (TBW - IBW), only above IBW. */
export function calcAdjBW(tbwKg: number, ibwKg: number): number {
  return tbwKg > ibwKg ? ibwKg + 0.4 * (tbwKg - ibwKg) : tbwKg;
}

export function calcBMI(tbwKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return tbwKg / (heightM * heightM);
}

/**
 * Derives every weight the dose calculator might need from whatever the user
 * has entered so far. Anything that can't be derived is simply left undefined,
 * and the calculator falls back to total body weight.
 */
export function derivePatientWeights(values: Record<string, string | string[]>): PatientWeights {
  const tbwKg = parseWeightKg(values.tbwKg);
  const heightCm = parseHeightCm(values.heightCm);
  const sex = parseSex(values.demographics);

  // An explicitly entered IBW always wins over the calculated one.
  const enteredIbw = parseWeightKg(values.ibwKg);
  const ibwKg = enteredIbw ?? (heightCm && sex ? calcIBW(heightCm, sex) : undefined);

  const bmi = tbwKg && heightCm ? calcBMI(tbwKg, heightCm) : undefined;
  const lbwKg = tbwKg && heightCm && sex ? calcLBW(tbwKg, heightCm, sex) : undefined;
  const adjBwKg = tbwKg && ibwKg ? calcAdjBW(tbwKg, ibwKg) : undefined;

  return { tbwKg, heightCm, sex, ibwKg, lbwKg, adjBwKg, bmi };
}
