// Medical vocabulary used to clean up phone speech-to-text output.
//
// The Web Speech API gives no way to supply a custom vocabulary or language
// model, so medical terms come back garbled ("rocuronium" -> "rock uranium").
// Everything here is applied *after* recognition: known mis-hearings are
// rewritten, then remaining tokens are fuzzy-matched against this canonical
// list.
//
// This list is yours to extend - when the recognizer mangles a word you use
// often, add the garbled form to that entry's `variants`.

export interface VocabEntry {
  /** Canonical display form, including the casing you want in the note. */
  display: string;
  /** Known mis-recognitions. May contain spaces (matched as a phrase). */
  variants?: string[];
}

export const MEDICAL_VOCAB: VocabEntry[] = [
  // --- Induction / sedation / maintenance agents ---
  { display: 'Propofol', variants: ['propofal', 'profofol', 'pro pofol', 'propafol', 'propranol pofol'] },
  { display: 'Etomidate', variants: ['etomidat', 'atomidate', 'e tomidate', 'automated'] },
  { display: 'Ketamine', variants: ['ketamin', 'keta mean', 'cat amine'] },
  { display: 'Midazolam', variants: ['midazolam', 'mid azolam', 'midas alam'] },
  { display: 'Versed', variants: ['versaid', 'ver said', 'versa'] },
  { display: 'Dexmedetomidine', variants: ['dex med etomidine', 'dexmedetomidin', 'precedex', 'presidex'] },
  { display: 'Sevoflurane', variants: ['sevo flurane', 'seven flurane', 'sevoflurain'] },
  { display: 'Desflurane', variants: ['des flurane', 'dez flurane'] },
  { display: 'Isoflurane', variants: ['iso flurane'] },
  { display: 'TIVA', variants: ['tiva', 'teva', 't i v a'] },

  // --- Opioids / analgesia ---
  { display: 'Fentanyl', variants: ['fentanel', 'fentynal', 'fenta nil', 'fent'] },
  { display: 'Hydromorphone', variants: ['hydro morphone', 'dilaudid', 'die loaded'] },
  { display: 'Morphine', variants: ['morphin'] },
  { display: 'Remifentanil', variants: ['remi fentanil', 'remifentanyl'] },
  { display: 'Ketorolac', variants: ['keto rolac', 'toradol', 'tore a doll'] },
  { display: 'Acetaminophen', variants: ['a cetaminophen', 'tylenol'] },
  { display: 'Lidocaine', variants: ['lido cane', 'lidocane'] },
  { display: 'Bupivacaine', variants: ['bupiva cane', 'bupivicaine', 'marcaine'] },
  { display: 'Ropivacaine', variants: ['ropiva cane', 'ropivicaine'] },

  // --- Neuromuscular blockers / reversal ---
  { display: 'Rocuronium', variants: ['rock uranium', 'rocuronian', 'rocker onium', 'roc uronium', 'roc'] },
  { display: 'Vecuronium', variants: ['vec uronium', 'vecuronian'] },
  { display: 'Cisatracurium', variants: ['cis atracurium', 'sister curium'] },
  { display: 'Succinylcholine', variants: ['succinyl choline', 'sux', 'succs', 'succinocholine'] },
  { display: 'Sugammadex', variants: ['sugar mad ex', 'sugam a dex', 'sugammadecks', 'sugamadex'] },
  { display: 'Neostigmine', variants: ['neo stigmine', 'neostigmin'] },
  { display: 'Glycopyrrolate', variants: ['glyco pyrrolate', 'glide co pyrrolate', 'glycopyralate', 'robinul'] },
  { display: 'Atropine', variants: ['atro pine', 'a tropine'] },

  // --- Vasoactives ---
  { display: 'Phenylephrine', variants: ['phenyl efrin', 'phenylephrin', 'fenil efrin', 'neo synephrine'] },
  { display: 'Ephedrine', variants: ['ef edrine', 'a fedrine'] },
  { display: 'Norepinephrine', variants: ['nor epinephrine', 'levophed', 'norepi'] },
  { display: 'Epinephrine', variants: ['epi nephrine', 'epi'] },
  { display: 'Vasopressin', variants: ['vaso pressin'] },
  { display: 'Labetalol', variants: ['la beta lol', 'labetolol', 'lab etalol'] },
  { display: 'Hydralazine', variants: ['hydra lazine', 'hydralizine'] },
  { display: 'Esmolol', variants: ['es molol', 'esmolal'] },
  { display: 'Nicardipine', variants: ['ni cardipine', 'nicardipin'] },
  { display: 'Clevidipine', variants: ['clev idipine', 'cleviprex'] },

  // --- Antiemetics ---
  { display: 'Ondansetron', variants: ['on dansetron', 'ondansetran'] },
  { display: 'Zofran', variants: ['so fran', 'zo fran'] },
  { display: 'Dexamethasone', variants: ['dexa methasone', 'decadron', 'deca dron'] },
  { display: 'Metoclopramide', variants: ['meto clopramide', 'reglan'] },
  { display: 'Scopolamine', variants: ['scopol amine', 'scope olamine'] },

  // --- Antibiotics / hemostasis ---
  { display: 'Cefazolin', variants: ['sef azolin', 'cefazolan', 'ancef', 'an cef'] },
  { display: 'Vancomycin', variants: ['vanco mycin', 'vanco'] },
  { display: 'Clindamycin', variants: ['clinda mycin', 'clinda'] },
  { display: 'Tranexamic acid', variants: ['tranexamic', 'tran exam ic acid', 'txa'] },
  { display: 'Protamine', variants: ['prota mine'] },
  { display: 'Heparin', variants: ['hep arin'] },

  // --- Home meds ---
  { display: 'Metoprolol', variants: ['meta prolol', 'metoprolal', 'metropolol'] },
  { display: 'Atorvastatin', variants: ['ator vastatin', 'lipitor'] },
  { display: 'Lisinopril', variants: ['lisin april', 'lisinopril', 'licinopril'] },
  { display: 'Amlodipine', variants: ['am lodipine'] },
  { display: 'Metformin', variants: ['met formin'] },
  { display: 'Apixaban', variants: ['apix aban', 'eliquis', 'elequis'] },
  { display: 'Rivaroxaban', variants: ['rivarox aban', 'xarelto'] },
  { display: 'Clopidogrel', variants: ['clopi dogrel', 'plavix'] },
  { display: 'Warfarin', variants: ['war farin', 'coumadin'] },
  { display: 'Enoxaparin', variants: ['enox aparin', 'lovenox'] },
  // Deliberately no "asa" variant here - in this template ASA means physical
  // status classification far more often than aspirin.
  { display: 'Aspirin' },
  { display: 'Insulin', variants: ['in sulin'] },
  { display: 'Levothyroxine', variants: ['levo thyroxine', 'synthroid'] },
  { display: 'Gabapentin', variants: ['gaba pentin'] },
  { display: 'Semaglutide', variants: ['sema glutide', 'ozempic', 'wegovy'] },

  // --- Procedures ---
  { display: 'laparoscopic', variants: ['lap or scopic', 'laproscopic', 'lapro scopic', 'lap arascopic'] },
  { display: 'cholecystectomy', variants: ['coli cystectomy', 'chole cystectomy', 'colecystectomy', 'cole sistectomy'] },
  { display: 'lap chole', variants: ['lap coley', 'lap kohli', 'lapchole'] },
  { display: 'appendectomy', variants: ['appen dectomy', 'apendectomy'] },
  { display: 'hysterectomy', variants: ['hyster ectomy'] },
  { display: 'craniotomy', variants: ['crani otomy', 'cranny otomy'] },
  { display: 'thoracotomy', variants: ['thora cotomy'] },
  { display: 'sternotomy', variants: ['stern otomy'] },
  { display: 'cystoscopy', variants: ['cysto scopy', 'sist oscopy'] },
  { display: 'colonoscopy', variants: ['colon oscopy'] },
  { display: 'arthroplasty', variants: ['arthro plasty', 'author plasty'] },
  { display: 'arthroscopy', variants: ['arthro scopy'] },
  { display: 'hemiarthroplasty', variants: ['hemi arthroplasty'] },
  { display: 'laminectomy', variants: ['lamin ectomy'] },
  { display: 'discectomy', variants: ['disc ectomy', 'diskectomy'] },
  { display: 'nephrectomy', variants: ['nephr ectomy'] },
  { display: 'prostatectomy', variants: ['prostat ectomy'] },
  { display: 'mastectomy', variants: ['mast ectomy'] },
  { display: 'thyroidectomy', variants: ['thyroid ectomy'] },
  { display: 'tonsillectomy', variants: ['tonsil ectomy', 'tonsillect omy'] },
  { display: 'esophagogastroduodenoscopy', variants: ['egd'] },
  { display: 'ERCP', variants: ['ercp', 'e r c p'] },
  { display: 'TURP', variants: ['turp', 't u r p'] },
  { display: 'ORIF', variants: ['orif', 'o r i f', 'or if'] },
  { display: 'TAVR', variants: ['taver', 'tavern', 'tab ver', 't a v r'] },
  { display: 'CABG', variants: ['cabbage', 'cabg', 'c a b g'] },
  { display: 'carotid endarterectomy', variants: ['carotid end arterectomy', 'cea'] },
  { display: 'EVAR', variants: ['evar', 'e var'] },
  { display: 'craniectomy', variants: ['crani ectomy'] },
  { display: 'fasciotomy', variants: ['fasci otomy'] },
  { display: 'tracheostomy', variants: ['trache ostomy', 'trach'] },

  // --- Airway / technique ---
  { display: 'Mallampati', variants: ['mallam patti', 'mallam pati', 'mal am potty', 'malampati'] },
  { display: 'intubation', variants: ['in tubation'] },
  { display: 'intubate', variants: ['in tubate'] },
  { display: 'extubate', variants: ['ex tubate'] },
  { display: 'laryngoscopy', variants: ['laryngo scopy', 'lieran goscopy'] },
  { display: 'laryngoscope', variants: ['laryngo scope'] },
  { display: 'fiberoptic', variants: ['fiber optic'] },
  { display: 'LMA', variants: ['lma', 'l m a', 'elle em ay'] },
  { display: 'ETT', variants: ['ett', 'e t t'] },
  { display: 'thyromental', variants: ['thyro mental', 'thigh romental'] },
  { display: 'edentulous', variants: ['e dentulous'] },
  { display: 'RSI', variants: ['rsi', 'r s i', 'rapid sequence'] },
  { display: 'interscalene', variants: ['inter scalene', 'inter silline', 'intrascalene'] },
  { display: 'supraclavicular', variants: ['supra clavicular'] },
  { display: 'infraclavicular', variants: ['infra clavicular'] },
  { display: 'adductor canal', variants: ['abductor canal'] },
  { display: 'popliteal', variants: ['pop liteal'] },
  { display: 'erector spinae', variants: ['erector spiny', 'erector spine a'] },
  { display: 'epidural', variants: ['epi dural'] },
  { display: 'neuraxial', variants: ['neuro axial', 'neur axial'] },
  { display: 'paravertebral', variants: ['para vertebral'] },

  // --- Conditions ---
  { display: 'hypertension', variants: ['hyper tension'] },
  { display: 'hyperlipidemia', variants: ['hyper lipidemia', 'hyperlipedemia'] },
  { display: 'diabetes mellitus', variants: ['diabetes melitus'] },
  { display: 'atrial fibrillation', variants: ['atrial fib', 'a fib', 'afib', 'atrial fibulation'] },
  { display: 'aortic stenosis', variants: ['aortic stinosis', 'a ortic stenosis'] },
  { display: 'mitral regurgitation', variants: ['mitral regurg'] },
  { display: 'cardiomyopathy', variants: ['cardio myopathy'] },
  { display: 'myocardial infarction', variants: ['myo cardial infarction', 'mi'] },
  { display: 'obstructive sleep apnea', variants: ['obstructive sleep apnia', 'sleep apnia'] },
  { display: 'COPD', variants: ['copd', 'c o p d'] },
  { display: 'GERD', variants: ['gerd', 'g e r d'] },
  { display: 'CHF', variants: ['chf', 'c h f'] },
  { display: 'CAD', variants: ['cad', 'c a d'] },
  { display: 'CKD', variants: ['ckd', 'c k d'] },
  { display: 'ESRD', variants: ['esrd', 'e s r d'] },
  { display: 'DVT', variants: ['dvt', 'd v t'] },
  { display: 'PE', variants: ['p e'] },
  { display: 'CVA', variants: ['cva', 'c v a'] },
  { display: 'PONV', variants: ['ponv', 'p o n v', 'pawn v', 'piano v', 'piano vee', 'pono v', 'pon v'] },
  { display: 'malignant hyperthermia', variants: ['malignant hyper thermia'] },
  { display: 'pulmonary hypertension', variants: ['pulmonary hyper tension'] },
  { display: 'cirrhosis', variants: ['sir osis', 'ser osis'] },
  { display: 'anemia', variants: ['a nemia'] },
  { display: 'thrombocytopenia', variants: ['thrombo cytopenia'] },
  { display: 'preeclampsia', variants: ['pre eclampsia'] },

  // --- Labs / studies / monitoring ---
  { display: 'hemoglobin', variants: ['hemo globin', 'hgb'] },
  { display: 'hematocrit', variants: ['hemato crit', 'hct'] },
  { display: 'platelets', variants: ['plate lets', 'plt'] },
  { display: 'creatinine', variants: ['creatinin', 'creat nine', 'cre atinine'] },
  { display: 'potassium', variants: ['po tassium'] },
  { display: 'sodium', variants: ['so dium'] },
  { display: 'glucose', variants: ['gluco se'] },
  { display: 'INR', variants: ['inr', 'i n r'] },
  { display: 'PTT', variants: ['ptt', 'p t t'] },
  { display: 'BMP', variants: ['bmp', 'b m p'] },
  { display: 'CBC', variants: ['cbc', 'c b c'] },
  { display: 'EKG', variants: ['ekg', 'e k g', 'ecg', 'e c g'] },
  { display: 'echocardiogram', variants: ['echo cardiogram'] },
  { display: 'ejection fraction', variants: ['ejection fracture', 'e jection fraction'] },
  { display: 'ETCO2', variants: ['etco2', 'et co2', 'end tidal co2', 'e t c o two'] },
  { display: 'NIBP', variants: ['nibp', 'n i b p'] },
  { display: 'SpO2', variants: ['spo2', 's p o two'] },
  // Kept as its own term (not folded into SpO2) so it still matches the
  // "Pulse Ox" monitor option.
  { display: 'Pulse Ox', variants: ['pulse ox', 'pulse oximetry'] },
  { display: 'TEE', variants: ['tee', 't e e'] },
  { display: 'arterial line', variants: ['a line', 'art line', 'arterial lion'] },
  { display: 'central line', variants: ['central lion'] },
  { display: 'NIRS', variants: ['nirs', 'n i r s'] },
  { display: 'BIS', variants: ['bis monitor'] },

  // --- Status / misc ---
  { display: 'NPO', variants: ['npo', 'n p o', 'in p o'] },
  { display: 'NKDA', variants: ['nkda', 'n k d a', 'no known drug allergies'] },
  { display: 'ASA', variants: ['a s a class'] },
  { display: 'PACU', variants: ['pacu', 'p a c u', 'pack you'] },
  { display: 'ICU', variants: ['icu', 'i c u'] },
  { display: 'PIV', variants: ['piv', 'p i v'] },
  { display: 'IV', variants: ['i v'] },
  { display: 'BMI', variants: ['bmi', 'b m i'] },
  { display: 'anesthesia', variants: ['an esthesia', 'anasthesia'] },
  { display: 'anesthetic', variants: ['an esthetic', 'anasthetic'] },
  { display: 'insufflation', variants: ['in sufflation', 'insuflation'] },
  { display: 'pneumoperitoneum', variants: ['pneumo peritoneum', 'numo peritoneum'] },
  { display: 'Trendelenburg', variants: ['trendelen burg', 'trendelenberg', 'trend delen burg'] },
  { display: 'lithotomy', variants: ['litho tomy'] },
  { display: 'supine', variants: ['su pine'] },
  { display: 'prone', variants: ['prohn'] },
];

// Filler words stripped from dictated text.
export const FILLER_WORDS = ['um', 'uh', 'er', 'ah', 'hmm', 'mmm', 'like i said'];

/**
 * Whole-phrase rewrites for things speech recognition mangles badly enough
 * that word-level correction can't recover them - social history in
 * particular ("doesn't drink or do drugs" comes back as nonsense).
 * Applied before any other correction; add your own as you hit them.
 */
export const PHRASE_CORRECTIONS: { wrong: RegExp; right: string }[] = [
  { wrong: /\bdodger king or drish\b/gi, right: "doesn't drink or do drugs" },
  { wrong: /\bdoesn'?t drink or do drugs\b/gi, right: 'Denies alcohol and drugs' },
  { wrong: /\bdoes not drink or do drugs\b/gi, right: 'Denies alcohol and drugs' },
  { wrong: /\bno alcohol or drugs?\b/gi, right: 'Denies alcohol and drugs' },
  { wrong: /\bdenies (tobacco|smoking),? (alcohol),? (and )?(drugs?|illicits?)\b/gi, right: 'Denies tobacco, alcohol, and drugs' },
  { wrong: /\bno tobacco,? (alcohol|etoh),? (or|and) drugs?\b/gi, right: 'Denies tobacco, alcohol, and drugs' },
  { wrong: /\bhigh piano v\b/gi, right: 'high PONV' },
  { wrong: /\bpiano v risk\b/gi, right: 'PONV risk' },
  { wrong: /\bnothing by mouth\b/gi, right: 'NPO' },
  { wrong: /\blarge bore i ?vs?\b/gi, right: 'large bore IV' },
  { wrong: /\btwo large bore\b/gi, right: '2 large bore' },
  { wrong: /\ba line\b/gi, right: 'A-line' },
];
