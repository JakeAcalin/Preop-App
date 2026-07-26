/**
 * Rotation labels used to place a case in time without recording a date.
 * A rotation describes the resident's schedule, not the patient's encounter,
 * so it isn't one of HIPAA's 18 identifiers - unlike a date of service.
 */
export const ROTATIONS = [
  'Orientation',
  'General OR',
  'Cardiac',
  'Thoracic',
  'Vascular',
  'Neuro',
  'OB',
  'Peds',
  'Regional / Acute Pain',
  'Ambulatory',
  'Trauma',
  'Transplant',
  'ICU',
  'Chronic Pain',
  'Night float',
  'Other',
];
