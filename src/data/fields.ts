import type { FieldDef, SectionDef } from '../types';

export const SECTIONS: SectionDef[] = [
  { id: 'case_info', label: 'Case Info' },
  { id: 'height_weight', label: 'Height & Weight' },
  { id: 'history', label: 'Hx' },
  { id: 'anesthesia_plan', label: 'Anesthesia Plan' },
  { id: 'disposition', label: 'Disposition & Post-Op' },
  { id: 'notes', label: 'Additional Notes' },
];

// Drug/dose presets are seeded from your own template - treat them as your
// personal quick-pick list, editable here, not a formulary recommendation.
const ANESTHESIA_TYPE_OPTIONS = ['General', 'MAC', 'Regional', 'Neuraxial', 'General + Regional'];
const ASA_OPTIONS = ['ASA 1', 'ASA 2', 'ASA 3', 'ASA 4', 'ASA 5', 'ASA 6', 'ASA 1E', 'ASA 2E', 'ASA 3E', 'ASA 4E', 'ASA 5E'];
const POSITION_OPTIONS = ['Supine', 'Prone', 'Lateral decubitus', 'Lithotomy', 'Beach chair', 'Sitting', 'Trendelenburg', 'Reverse Trendelenburg'];
const ACCESS_OPTIONS = ['1x PIV', '2x PIV', '2x PIV + A-line', 'Central line', 'PICC', 'Existing port/PICC'];
const MONITOR_OPTIONS = ['EKG', 'Temp', 'NIBP', 'Pulse Ox', 'ETCO2', 'Arterial Line', 'CVP', 'TEE', 'BIS/EEG', 'NIRS', 'Foley'];
const EQUIPMENT_OPTIONS = ['Bear hugger', 'Fluid warmer', 'Cell saver', 'Video laryngoscope', 'Defibrillator pads', 'Warming blanket', 'Rapid infuser'];
const PREMED_OPTIONS = ['Versed', 'Glycopyrrolate', 'None'];
const REGIONAL_OPTIONS = ['None', 'Interscalene', 'Supraclavicular', 'Infraclavicular', 'Femoral', 'Adductor canal', 'Popliteal sciatic', 'TAP block', 'Erector spinae', 'Spinal', 'Epidural'];
const INDUCTION_OPTIONS = ['Propofol 2mg/kg', 'Etomidate 0.2-0.3mg/kg', 'Ketamine 1-2mg/kg', 'Fentanyl 1-2mcg/kg', 'Lidocaine 1mg/kg', 'Rocuronium 0.6mg/kg', 'Succinylcholine 1-1.5mg/kg'];
const SEDATION_OPTIONS = ['Versed', 'Propofol gtt', 'Dexmedetomidine gtt', 'None'];
const MAINTENANCE_OPTIONS = ['Sevoflurane', 'Desflurane', 'Isoflurane', 'TIVA', 'Sevoflurane + N2O'];
const NM_BLOCK_OPTIONS = ['None', 'Rocuronium', 'Vecuronium', 'Succinylcholine', 'Cisatracurium'];
const REVERSAL_OPTIONS = ['None needed', 'Sugammadex', 'Neostigmine + Glycopyrrolate'];
const PONV_RISK_OPTIONS = ['Female', 'Nonsmoker', 'Hx of PONV/motion sickness', 'Postop opioids expected'];
const ANTIEMETIC_OPTIONS = ['Zofran', 'Decadron', 'Reglan', 'Scopolamine patch', 'Haldol'];
const PRESSOR_OPTIONS = ['Phenylephrine', 'Ephedrine', 'Norepinephrine', 'Vasopressin', 'Epinephrine'];
const ANTIHYPERTENSIVE_OPTIONS = ['Labetalol', 'Hydralazine', 'Esmolol', 'Nicardipine', 'Clevidipine'];
const ANTICHOLINERGIC_OPTIONS = ['Glycopyrrolate', 'Atropine'];
const HEMOSTASIS_OPTIONS = ['Protamine', 'TXA', 'DDAVP', 'Factor products'];
const DISPOSITION_OPTIONS = ['PACU', 'ICU', 'Stepdown'];
const YES_NO_OPTIONS = ['Yes', 'No'];

export const FIELDS: FieldDef[] = [
  // Case Info
  {
    id: 'csn', label: 'CSN', section: 'case_info', type: 'text', required: true,
    keywords: ['csn'],
  },
  {
    id: 'demographics', label: 'Demographics', section: 'case_info', type: 'text', required: true,
    keywords: ['year old', 'years old', 'yo male', 'yo female', 'age of'],
  },
  {
    id: 'dx', label: 'Dx', section: 'case_info', type: 'textarea', required: true,
    keywords: ['diagnosis of', 'diagnosed with', 'dx of', 'presenting with'],
  },
  {
    id: 'plannedProcedure', label: 'Planned Surgery/Procedure', section: 'case_info', type: 'text', required: true,
    keywords: ['scheduled for', 'procedure is', 'here for', 'planned procedure', 'planned surgery'],
  },

  // Height & Weight
  {
    id: 'heightCm', label: 'Height (cm)', section: 'height_weight', type: 'text',
    keywords: ['height of', 'centimeters tall'],
  },
  {
    id: 'tbwKg', label: 'TBW (kg)', section: 'height_weight', type: 'text',
    keywords: ['weighs', 'weight of', 'total body weight'],
  },
  {
    id: 'ibwKg', label: 'IBW (kg)', section: 'height_weight', type: 'text',
    keywords: ['ideal body weight'],
  },
  {
    id: 'bmi', label: 'BMI', section: 'height_weight', type: 'text',
    keywords: ['bmi of', 'body mass index'],
  },

  // Hx
  {
    id: 'allergies', label: 'Allergies', section: 'history', type: 'textarea', required: true,
    keywords: ['allergic to', 'allergies', 'nkda', 'no known drug allergies'],
  },
  {
    id: 'pertinentPmhx', label: 'Pertinent PMHx', section: 'history', type: 'textarea', required: true,
    keywords: ['past medical history', 'pmh', 'pmhx', 'medical history'],
  },
  {
    id: 'pertinentShx', label: 'Pertinent SHx', section: 'history', type: 'textarea',
    keywords: ['surgical history', 'shx', 'prior surgeries', 'previous surgery'],
  },
  {
    id: 'cardiacHx', label: 'Cardiac Hx', section: 'history', type: 'textarea',
    keywords: ['cardiac history', 'cardiac hx', 'heart history', 'murmur', 'arrhythmia', 'afib', 'atrial fibrillation', 'mi in', 'myocardial infarction'],
  },
  {
    id: 'homeMeds', label: 'Current/Home Meds', section: 'history', type: 'textarea', required: true,
    keywords: ['home medications', 'current medications', 'takes', 'medication list', 'currently on'],
  },
  {
    id: 'pertinentRos', label: 'Pertinent ROS', section: 'history', type: 'textarea',
    keywords: ['review of systems', 'ros'],
  },
  {
    id: 'labs', label: 'Labs', section: 'history', type: 'textarea',
    keywords: ['hemoglobin', 'hgb', 'hematocrit', 'hct', 'platelets', 'potassium', 'sodium', 'creatinine', 'glucose of', 'inr', 'ptt', 'coags'],
  },
  {
    id: 'notableExamImaging', label: 'Notable Exam/Imaging', section: 'history', type: 'textarea',
    keywords: ['ekg shows', 'echo shows', 'ejection fraction', 'ef of', 'ct scan', 'x-ray', 'chest x ray', 'mallampati', 'airway exam'],
  },
  {
    id: 'smokingAlcoholDrugs', label: 'Smoking, Alcohol, Drugs', section: 'history', type: 'text',
    keywords: ['smokes', 'smoking history', 'pack year', 'tobacco', 'alcohol', 'drinks', 'drug use', 'illicit'],
  },
  {
    id: 'previousAnesthesia', label: 'Previous Anesthesia', section: 'history', type: 'textarea',
    keywords: ['previous anesthesia', 'anesthesia history', 'difficult airway', 'difficult intubation', 'ponv', 'malignant hyperthermia', 'family history of anesthesia'],
  },

  // Anesthesia Plan
  {
    id: 'asa', label: 'ASA', section: 'anesthesia_plan', type: 'select', options: ASA_OPTIONS,
    keywords: ['asa class', 'asa 1', 'asa 2', 'asa 3', 'asa 4', 'asa 5', 'asa 6'],
  },
  {
    id: 'anesthesiaType', label: 'Anesthesia Type', section: 'anesthesia_plan', type: 'select', options: ANESTHESIA_TYPE_OPTIONS,
    keywords: ['general anesthesia', 'mac anesthesia', 'regional anesthesia', 'neuraxial'],
  },
  {
    id: 'preopLabs', label: 'Preop Labs', section: 'anesthesia_plan', type: 'textarea',
    keywords: ['preop labs', 'pre-op labs'],
  },
  {
    id: 'bloodProducts', label: 'Blood Products', section: 'anesthesia_plan', type: 'text',
    keywords: ['type and cross', 'type and screen', 'blood products', 'units of blood'],
  },
  {
    id: 'access', label: 'Access', section: 'anesthesia_plan', type: 'select', options: ACCESS_OPTIONS,
    keywords: ['iv access', 'iv placed', 'central line', 'a-line', 'arterial line'],
  },
  {
    id: 'equipment', label: 'Equipment', section: 'anesthesia_plan', type: 'multiselect', options: EQUIPMENT_OPTIONS,
    keywords: ['bear hugger', 'fluid warmer', 'cell saver', 'video laryngoscope', 'warming blanket', 'rapid infuser'],
  },
  {
    id: 'position', label: 'Position', section: 'anesthesia_plan', type: 'select', options: POSITION_OPTIONS,
    keywords: ['supine', 'prone', 'lateral decubitus', 'lithotomy', 'beach chair', 'sitting position', 'trendelenburg'],
  },
  {
    id: 'monitors', label: 'Monitors', section: 'anesthesia_plan', type: 'multiselect', options: MONITOR_OPTIONS,
    keywords: ['arterial line', 'central venous', 'tee monitoring', 'bis monitor', 'nirs', 'foley catheter'],
  },
  {
    id: 'airway', label: 'Airway', section: 'anesthesia_plan', type: 'text',
    keywords: ['plan to intubate', 'lma', 'video laryngoscope', 'awake fiberoptic', 'ett size', 'endotracheal tube'],
  },
  {
    id: 'fluids', label: 'Fluids', section: 'anesthesia_plan', type: 'text',
    keywords: ['lactated ringers', 'normal saline', 'plasmalyte'],
  },
  {
    id: 'antibiotics', label: 'Antibiotics', section: 'anesthesia_plan', type: 'text',
    keywords: ['cefazolin', 'vancomycin', 'clindamycin', 'antibiotic prophylaxis'],
  },
  {
    id: 'premedication', label: 'Premedication', section: 'anesthesia_plan', type: 'select', options: PREMED_OPTIONS,
    keywords: ['premedication', 'premedicated with'],
  },
  {
    id: 'regional', label: 'Regional', section: 'anesthesia_plan', type: 'select', options: REGIONAL_OPTIONS,
    keywords: ['nerve block', 'interscalene', 'supraclavicular', 'femoral block', 'adductor canal', 'tap block', 'erector spinae', 'spinal anesthesia', 'epidural'],
  },
  {
    id: 'induction', label: 'Induction', section: 'anesthesia_plan', type: 'multiselect', options: INDUCTION_OPTIONS,
    keywords: ['induction with', 'induce with'],
  },
  {
    id: 'sedation', label: 'Sedation', section: 'anesthesia_plan', type: 'select', options: SEDATION_OPTIONS,
    keywords: ['sedation with', 'sedated with'],
  },
  {
    id: 'maintenance', label: 'Maintenance', section: 'anesthesia_plan', type: 'select', options: MAINTENANCE_OPTIONS,
    keywords: ['maintenance with', 'maintained on', 'tiva'],
  },
  {
    id: 'nmBlock', label: 'NM Block', section: 'anesthesia_plan', type: 'select', options: NM_BLOCK_OPTIONS,
    keywords: ['neuromuscular block', 'paralytic'],
  },
  {
    id: 'reversal', label: 'Reversal', section: 'anesthesia_plan', type: 'select', options: REVERSAL_OPTIONS,
    keywords: ['reversal with', 'sugammadex', 'neostigmine'],
  },
  {
    id: 'intraopAnalgesia', label: 'Intraop Analgesia', section: 'anesthesia_plan', type: 'text',
    keywords: ['intraop analgesia', 'intraoperative analgesia', 'fentanyl gtt', 'hydromorphone'],
  },
  {
    id: 'ponvRisk', label: 'PONV Risk', section: 'anesthesia_plan', type: 'multiselect', options: PONV_RISK_OPTIONS,
    keywords: ['ponv risk', 'apfel score'],
  },
  {
    id: 'antiemetics', label: 'Antiemetics', section: 'anesthesia_plan', type: 'multiselect', options: ANTIEMETIC_OPTIONS,
    keywords: ['zofran', 'ondansetron', 'decadron', 'dexamethasone', 'reglan', 'metoclopramide', 'scopolamine patch'],
  },
  {
    id: 'pressors', label: 'Pressors', section: 'anesthesia_plan', type: 'multiselect', options: PRESSOR_OPTIONS,
    keywords: ['phenylephrine', 'ephedrine', 'norepinephrine', 'vasopressin gtt'],
  },
  {
    id: 'antihypertensives', label: 'Antihypertensives', section: 'anesthesia_plan', type: 'multiselect', options: ANTIHYPERTENSIVE_OPTIONS,
    keywords: ['labetalol', 'hydralazine', 'esmolol', 'nicardipine', 'clevidipine'],
  },
  {
    id: 'anticholinergics', label: 'Anticholinergics', section: 'anesthesia_plan', type: 'multiselect', options: ANTICHOLINERGIC_OPTIONS,
    keywords: ['glycopyrrolate', 'atropine'],
  },
  {
    id: 'anticoagulation', label: 'Anticoagulation', section: 'anesthesia_plan', type: 'textarea',
    keywords: ['anticoagulation', 'holding warfarin', 'holding eliquis', 'holding apixaban', 'bridging with', 'lovenox'],
  },
  {
    id: 'hemostasis', label: 'Hemostasis', section: 'anesthesia_plan', type: 'multiselect', options: HEMOSTASIS_OPTIONS,
    keywords: ['protamine', 'tranexamic acid', 'txa', 'ddavp', 'desmopressin'],
  },
  {
    id: 'onPump', label: 'On Pump', section: 'anesthesia_plan', type: 'select', options: YES_NO_OPTIONS,
    keywords: ['on pump', 'cardiopulmonary bypass', 'cpb'],
  },

  // Disposition & Post-Op
  {
    id: 'disposition', label: 'Disposition', section: 'disposition', type: 'select', options: DISPOSITION_OPTIONS,
    keywords: ['going to icu', 'to the icu', 'pacu', 'stepdown'],
  },
  {
    id: 'postOpLabs', label: 'Post Op Labs', section: 'disposition', type: 'text',
    keywords: ['post op labs', 'postop labs'],
  },
  {
    id: 'specialEquipment', label: 'Special Equipment', section: 'disposition', type: 'text',
    keywords: ['special equipment'],
  },
  {
    id: 'analgesia', label: 'Analgesia', section: 'disposition', type: 'text',
    keywords: ['postop analgesia', 'pain regimen', 'pca'],
  },
  {
    id: 'rescueAntiemetics', label: 'Rescue Antiemetics', section: 'disposition', type: 'multiselect', options: ANTIEMETIC_OPTIONS,
    keywords: ['rescue antiemetic'],
  },
  {
    id: 'rescueAntihypertensives', label: 'Rescue Antihypertensives', section: 'disposition', type: 'multiselect', options: ANTIHYPERTENSIVE_OPTIONS,
    keywords: ['rescue antihypertensive'],
  },
  {
    id: 'rescuePressors', label: 'Rescue Pressors', section: 'disposition', type: 'multiselect', options: PRESSOR_OPTIONS,
    keywords: ['rescue pressor'],
  },

  // Additional Notes
  {
    id: 'additionalNotes', label: 'Additional Notes', section: 'notes', type: 'textarea',
    keywords: ['additional notes', 'also note', 'one more thing'],
  },
];

export const REQUIRED_FIELDS = FIELDS.filter((f) => f.required);
