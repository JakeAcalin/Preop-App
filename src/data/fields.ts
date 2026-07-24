import type { FieldDef, SectionDef } from '../types';

export const SECTIONS: SectionDef[] = [
  { id: 'identification', label: 'Identification & Procedure' },
  { id: 'history', label: 'PMH / PSH / Anesthesia History' },
  { id: 'meds_allergies', label: 'Medications & Allergies' },
  { id: 'airway', label: 'Airway Exam' },
  { id: 'systems', label: 'Systems Review' },
  { id: 'labs', label: 'Labs & Studies' },
  { id: 'social', label: 'Social History' },
  { id: 'logistics', label: 'NPO & Logistics' },
  { id: 'plan', label: 'Anesthetic Plan' },
];

export const FIELDS: FieldDef[] = [
  // Identification & Procedure
  {
    id: 'age', label: 'Age', section: 'identification', type: 'text', required: true,
    keywords: ['year old', 'years old', 'yo male', 'yo female', 'age of'],
  },
  {
    id: 'sex', label: 'Sex', section: 'identification', type: 'select', required: true,
    options: ['Male', 'Female'],
    keywords: ['male', 'female'],
  },
  {
    id: 'heightWeight', label: 'Height / Weight / BMI', section: 'identification', type: 'text',
    keywords: ['height of', 'weighs', 'weight of', 'bmi'],
  },
  {
    id: 'surgeon', label: 'Surgeon', section: 'identification', type: 'text',
    keywords: ['surgeon is', 'dr.', 'operating surgeon'],
  },
  {
    id: 'procedurePlanned', label: 'Procedure Planned', section: 'identification', type: 'text', required: true,
    keywords: ['scheduled for', 'procedure is', 'here for', 'planned procedure'],
  },
  {
    id: 'laterality', label: 'Laterality / Site', section: 'identification', type: 'select',
    options: ['Left', 'Right', 'Bilateral', 'N/A'],
    keywords: ['left side', 'right side', 'bilateral'],
  },

  // History
  {
    id: 'pmh', label: 'Past Medical History', section: 'history', type: 'textarea', required: true,
    keywords: ['past medical history', 'pmh', 'history of', 'medical history'],
  },
  {
    id: 'psh', label: 'Past Surgical History', section: 'history', type: 'textarea',
    keywords: ['past surgical history', 'psh', 'prior surgeries', 'previous surgery'],
  },
  {
    id: 'anesthesiaHistory', label: 'Anesthesia History / Complications', section: 'history', type: 'textarea',
    keywords: ['anesthesia history', 'difficult airway', 'difficult intubation', 'ponv', 'malignant hyperthermia', 'family history of anesthesia'],
  },

  // Meds & Allergies
  {
    id: 'homeMeds', label: 'Home Medications', section: 'meds_allergies', type: 'textarea', required: true,
    keywords: ['home medications', 'takes', 'medication list', 'currently on'],
  },
  {
    id: 'allergies', label: 'Allergies', section: 'meds_allergies', type: 'textarea', required: true,
    keywords: ['allergic to', 'allergies', 'nkda', 'no known drug allergies'],
  },

  // Airway
  {
    id: 'mallampati', label: 'Mallampati Class', section: 'airway', type: 'select',
    options: ['I', 'II', 'III', 'IV'],
    keywords: ['mallampati'],
  },
  {
    id: 'airwayExam', label: 'Airway Exam Notes', section: 'airway', type: 'textarea', required: true,
    keywords: ['mouth opening', 'thyromental', 'neck mobility', 'dentition', 'loose teeth', 'beard', 'neck circumference'],
  },

  // Systems
  {
    id: 'cardiac', label: 'Cardiac', section: 'systems', type: 'textarea',
    keywords: ['cardiac', 'heart', 'chest pain', 'murmur', 'arrhythmia', 'afib', 'atrial fibrillation'],
  },
  {
    id: 'pulmonary', label: 'Pulmonary', section: 'systems', type: 'textarea',
    keywords: ['pulmonary', 'lungs', 'copd', 'asthma', 'osa', 'sleep apnea', 'shortness of breath'],
  },
  {
    id: 'renal', label: 'Renal', section: 'systems', type: 'textarea',
    keywords: ['renal', 'kidney', 'dialysis', 'creatinine of'],
  },
  {
    id: 'other_systems', label: 'Other Systems', section: 'systems', type: 'textarea',
    keywords: ['gi', 'gastrointestinal', 'neuro', 'endocrine', 'diabetes', 'hepatic', 'liver'],
  },

  // Labs
  {
    id: 'cbc', label: 'CBC (Hgb/Hct/Plt)', section: 'labs', type: 'text',
    keywords: ['hemoglobin', 'hgb', 'hematocrit', 'hct', 'platelets'],
  },
  {
    id: 'bmp', label: 'BMP (lytes/Cr/glucose)', section: 'labs', type: 'text',
    keywords: ['potassium', 'sodium', 'creatinine', 'glucose of', 'bmp'],
  },
  {
    id: 'coags', label: 'Coags (INR/PTT)', section: 'labs', type: 'text',
    keywords: ['inr', 'ptt', 'coags', 'coagulation'],
  },
  {
    id: 'ekg', label: 'EKG', section: 'labs', type: 'text',
    keywords: ['ekg', 'ecg', 'sinus rhythm', 'ekg shows'],
  },
  {
    id: 'echo', label: 'Echo (EF, valves)', section: 'labs', type: 'text',
    keywords: ['echo', 'ejection fraction', 'ef of', 'valve'],
  },
  {
    id: 'otherStudies', label: 'Other Studies', section: 'labs', type: 'textarea',
    keywords: ['stress test', 'pft', 'pulmonary function', 'cath', 'catheterization', 'ct scan', 'x-ray', 'chest x ray'],
  },

  // Social
  {
    id: 'smoking', label: 'Smoking', section: 'social', type: 'text',
    keywords: ['smokes', 'smoking history', 'pack year', 'tobacco'],
  },
  {
    id: 'alcoholDrugs', label: 'Alcohol / Substance Use', section: 'social', type: 'text',
    keywords: ['alcohol', 'drinks', 'drug use', 'illicit'],
  },

  // Logistics
  {
    id: 'npoStatus', label: 'NPO Status', section: 'logistics', type: 'text', required: true,
    keywords: ['npo since', 'last ate', 'last meal', 'last po intake'],
  },
  {
    id: 'consentIvAccess', label: 'Consent / IV Access Notes', section: 'logistics', type: 'text',
    keywords: ['consent signed', 'iv access', 'iv placed'],
  },

  // Plan
  {
    id: 'anestheticType', label: 'Anesthetic Type', section: 'plan', type: 'select',
    options: ['General', 'MAC', 'Regional', 'Neuraxial', 'General + Regional'],
    keywords: ['general anesthesia', 'mac anesthesia', 'regional anesthesia', 'spinal', 'epidural', 'nerve block'],
  },
  {
    id: 'airwayPlan', label: 'Airway Plan', section: 'plan', type: 'text',
    keywords: ['plan to intubate', 'lma', 'video laryngoscope', 'awake fiberoptic'],
  },
  {
    id: 'linesMonitors', label: 'Lines / Monitors Plan', section: 'plan', type: 'textarea',
    keywords: ['arterial line', 'a-line', 'central line', 'cvc', 'additional monitors'],
  },
  {
    id: 'dispositionPlan', label: 'Disposition (PACU/ICU)', section: 'plan', type: 'select',
    options: ['PACU', 'ICU', 'Stepdown'],
    keywords: ['going to icu', 'to the icu', 'pacu', 'stepdown'],
  },
  {
    id: 'attendingNotes', label: 'Attending Discussion Notes', section: 'plan', type: 'textarea',
    keywords: ['discussed with attending', 'attending notes', 'plan discussed'],
  },
];

export const REQUIRED_FIELDS = FIELDS.filter((f) => f.required);
