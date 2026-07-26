import type { ProcedureConsiderations } from '../types';

// Curated reference notes on procedure-specific anesthetic considerations.
// This is a starting point you write/edit yourself -- it is NOT pulled live
// from Jaffe's, OpenEvidence, or any other external source. Treat it as a
// personal quick-reference to review and correct, not a substitute for
// primary literature or institutional protocol.
export const PROCEDURES: ProcedureConsiderations[] = [
  {
    key: 'tavr',
    label: 'TAVR (Transcatheter Aortic Valve Replacement)',
    aliases: ['tavr', 'transcatheter aortic valve'],
    monitors: [
      'Standard ASA monitors',
      'Arterial line (pre-induction)',
      'Consider CVC depending on access plan / vasoactive needs',
      'Defibrillator pads placed prior to start',
      'External/transvenous pacer or rapid ventricular pacing via wire coordinated with cath team',
      'TEE (if general anesthesia) or TTE availability if MAC',
    ],
    positioning: [
      'Supine, arms tucked',
      'Fluoroscopy table - confirm arm/access lines reach and are visible to imaging',
    ],
    anestheticConsiderations: [
      'GA vs MAC per institutional/patient factors - severe AS tolerates poorly with sudden vasodilation or tachycardia',
      'Maintain preload, avoid tachycardia, avoid abrupt drops in SVR',
      'Have vasopressor (phenylephrine/norepinephrine) readily available/infusing',
      'Rapid pacing runs cause transient hypotension - anticipate and coordinate timing with proceduralist',
      'Avoid negative inotropes in severe AS',
    ],
    complications: [
      'Annular rupture / aortic dissection',
      'Coronary occlusion',
      'Paravalvular leak',
      'Heart block requiring permanent pacemaker',
      'Vascular access complications (retroperitoneal bleed, dissection)',
      'Stroke',
      'Cardiac tamponade',
    ],
    equipment: ['Cell saver per institutional protocol', 'Blood type & cross available', 'Cardiac surgery/perfusion on standby per site protocol'],
  },
  {
    key: 'cea',
    label: 'Carotid Endarterectomy (CEA)',
    aliases: ['cea', 'carotid endarterectomy'],
    monitors: [
      'Standard ASA monitors',
      'Arterial line',
      'Consider cerebral oximetry (NIRS) or EEG per institutional practice',
      'Awake neuro checks if regional/cervical plexus block technique',
    ],
    positioning: ['Supine, head turned away from operative side, slight reverse Trendelenburg'],
    anestheticConsiderations: [
      'GA vs regional (deep/superficial cervical plexus block) - regional allows awake neuro monitoring',
      'Tight hemodynamic control - avoid hypertension (bleeding, hyperperfusion) and hypotension (cerebral ischemia)',
      'Maintain BP near patient baseline, especially during carotid cross-clamp',
      'Have vasopressor and antihypertensive both readily available',
    ],
    complications: [
      'Intraoperative stroke (cross-clamp ischemia, embolization)',
      'Carotid sinus reflex (bradycardia/hypotension with surgical manipulation)',
      'Post-op hypertension / hyperperfusion syndrome',
      'Neck hematoma - airway compromise risk, may need emergent reopening',
      'Cranial nerve injury',
    ],
  },
  {
    key: 'evar_aaa',
    label: 'AAA Repair (Open or EVAR)',
    aliases: ['aaa', 'abdominal aortic aneurysm', 'evar', 'open aaa repair'],
    monitors: [
      'Standard ASA monitors',
      'Arterial line',
      'Central line for open repair / large-bore IV access for both',
      'Consider TEE for open repair (hemodynamic monitoring during cross-clamp)',
    ],
    positioning: ['Supine; open repair may need wide prep/access for rapid volume resuscitation'],
    anestheticConsiderations: [
      'Large-bore IV access, blood products immediately available (type & cross)',
      'Anticipate hemodynamic swings with aortic cross-clamp/unclamp (afterload increase on clamp, decrease and vasodilation on unclamp)',
      'EVAR generally less physiologic stress than open - can often be done under regional/MAC',
      'Open repair: significant fluid shifts, consider cell saver',
    ],
    complications: [
      'Rupture / massive hemorrhage',
      'Renal ischemia (especially suprarenal clamp)',
      'Spinal cord ischemia (rare, more with extensive coverage)',
      'Post-unclamp hypotension',
      'Limb ischemia/embolization',
      'MI from hemodynamic stress',
    ],
    equipment: ['Rapid infuser', 'Cell saver', 'Blood bank notified/products available'],
  },
  {
    key: 'hip_fracture',
    label: 'Hip Fracture Repair (ORIF/Hemiarthroplasty)',
    aliases: ['hip fracture', 'orif hip', 'hemiarthroplasty'],
    monitors: ['Standard ASA monitors', 'Arterial line only if significant cardiac comorbidity/instability expected'],
    positioning: ['Lateral or supine on fracture table depending on approach - check for traction/positioning-related nerve injury risk'],
    anestheticConsiderations: [
      'Typically elderly, frail population - high perioperative risk, consider frailty and multiple comorbidities',
      'GA vs spinal/regional - regional may reduce delirium/PONV but assess for anticoagulation status first',
      'Watch for bone cement implantation syndrome if cemented prosthesis (hypotension, hypoxia, arrhythmia at cementing)',
      'Careful with fluid balance - avoid both hypovolemia and overload in elderly/cardiac patients',
    ],
    complications: [
      'Bone cement implantation syndrome',
      'Significant blood loss',
      'Fat embolism',
      'Postoperative delirium',
      'DVT/PE',
    ],
  },
  {
    key: 'lap_chole',
    label: 'Laparoscopic Cholecystectomy',
    aliases: ['lap chole', 'laparoscopic cholecystectomy', 'cholecystectomy', 'lap choley'],
    monitors: ['Standard ASA monitors', 'Consider NMT monitoring - deep block often requested for insufflation'],
    positioning: [
      'Supine, arms often tucked; reverse Trendelenburg + left tilt once pneumoperitoneum established',
      'Position change shifts venous return - re-check BP after the table is tilted',
    ],
    anestheticConsiderations: [
      'GA with ETT (not LMA) is typical - pneumoperitoneum raises intra-abdominal pressure and aspiration risk',
      'CO2 insufflation: expect hypercarbia and a rising ETCO2 - increase minute ventilation to compensate',
      'Insufflation raises peak airway pressures and reduces FRC - watch pressures, especially in obese/COPD patients',
      'Increased intra-abdominal pressure reduces venous return and can drop cardiac output/BP at insufflation',
      'Deep neuromuscular blockade is often requested to improve surgical working space',
      'High PONV-risk case - give multimodal prophylaxis (e.g. ondansetron + dexamethasone)',
      'Multimodal analgesia: local infiltration at port sites +/- TAP block reduces opioid need',
      'Have a plan for conversion to open - larger incision, more blood loss, more analgesia required',
    ],
    complications: [
      'CO2 embolism (rare but catastrophic - sudden ETCO2 drop with hypotension)',
      'Vagal bradycardia or asystole at peritoneal insufflation',
      'Pneumothorax / subcutaneous emphysema from CO2 tracking',
      'Endobronchial intubation as the diaphragm shifts cephalad with insufflation',
      'Bile duct or vascular injury requiring conversion to open',
      'Post-op shoulder tip pain from residual CO2',
    ],
  },
  {
    key: 'spine_fusion',
    label: 'Posterior Spine Fusion',
    aliases: ['spine fusion', 'posterior lumbar fusion', 'laminectomy', 'spinal fusion'],
    monitors: [
      'Standard ASA monitors',
      'Arterial line for longer/multilevel cases',
      'Neuromonitoring (SSEP/MEP) - requires TIVA, avoid volatile/paralytic per neuromonitoring team',
      'Large-bore IV access',
    ],
    positioning: [
      'Prone - careful eye/face/chest padding, confirm no pressure on eyes (ischemic optic neuropathy risk), abdomen free-hanging to reduce epidural venous pressure',
      'Careful neck positioning, secure ETT very well before turning prone',
    ],
    anestheticConsiderations: [
      'TIVA typically required if motor/SSEP monitoring used',
      'Significant blood loss possible in multilevel fusions - consider cell saver, tranexamic acid per protocol',
      'Controlled hypotension sometimes used to reduce bleeding (case/institution dependent)',
      'Careful fluid management - prone positioning + large incisions can have large third-space losses',
    ],
    complications: [
      'Postoperative vision loss (ischemic optic neuropathy) from prone positioning',
      'Major blood loss',
      'Nerve injury from positioning',
      'Venous air embolism',
      'Airway edema with prolonged prone positioning (consider cuff leak check before extubation)',
    ],
  },
  {
    key: 'total_joint',
    label: 'Total Hip / Knee Arthroplasty',
    aliases: ['total hip', 'total knee', 'tha', 'tka', 'hip arthroplasty', 'knee arthroplasty', 'joint replacement'],
    monitors: ['Standard ASA monitors', 'Arterial line only if significant cardiac disease'],
    positioning: ['Lateral (hip) or supine (knee) - pad dependent limb, check axillary roll and peroneal nerve'],
    anestheticConsiderations: [
      'Spinal/neuraxial is common and may reduce blood loss, DVT risk, and PONV - confirm anticoagulation status first',
      'Regional adjuncts: adductor canal block (knee), PENG/fascia iliaca (hip) for opioid-sparing analgesia',
      'Tranexamic acid commonly given per protocol to reduce blood loss',
      'Bone cement implantation syndrome risk if cemented - anticipate hypotension/hypoxia at cementing',
      'Tourniquet (knee): expect hypertension with prolonged inflation and washout of acid metabolites on release',
    ],
    complications: [
      'Bone cement implantation syndrome',
      'Fat/marrow embolism',
      'Significant blood loss',
      'DVT/PE',
      'Positioning-related nerve injury',
    ],
  },
  {
    key: 'egd_colonoscopy',
    label: 'EGD / Colonoscopy',
    aliases: ['egd', 'colonoscopy', 'endoscopy', 'upper endoscopy', 'esophagogastroduodenoscopy'],
    monitors: ['Standard ASA monitors', 'Capnography essential - shared/unprotected airway in a dark remote location'],
    positioning: ['Left lateral decubitus typically'],
    anestheticConsiderations: [
      'Usually MAC with propofol; airway is shared with the endoscopist and not protected',
      'Assess aspiration risk carefully (GERD, gastric outlet obstruction, recent food, GLP-1 agonist use) - consider ETT instead of MAC',
      'GLP-1 receptor agonists (semaglutide etc.) delay gastric emptying - check last dose and NPO status',
      'Remote/off-site location: confirm suction, oxygen, airway equipment and help availability before starting',
      'Brief but intensely stimulating moments (scope insertion) against minimal analgesic requirement afterward',
    ],
    complications: [
      'Airway obstruction/laryngospasm during shared-airway manipulation',
      'Aspiration',
      'Hypoxemia from oversedation',
      'Bowel perforation or bleeding (rare)',
      'Vagal response with insufflation/scope advancement',
    ],
  },
  {
    key: 'cesarean',
    label: 'Cesarean Section',
    aliases: ['cesarean', 'c section', 'c-section', 'caesarean'],
    monitors: ['Standard ASA monitors', 'Left uterine displacement essential', 'Arterial line only if severe preeclampsia/cardiac disease'],
    positioning: ['Supine with left lateral tilt/wedge to avoid aortocaval compression'],
    anestheticConsiderations: [
      'Neuraxial (spinal) preferred; GA reserved for emergencies or contraindications to neuraxial',
      'If GA: full stomach - RSI with cricoid, anticipate difficult airway (edema, breast tissue, weight gain)',
      'Aspiration prophylaxis (sodium citrate, H2 blocker, metoclopramide) per protocol',
      'Expect spinal-induced hypotension - phenylephrine infusion, adequate preload/co-load',
      'Oxytocin after delivery causes vasodilation/tachycardia - give as an infusion, not a rapid bolus',
      'Have uterotonics and a hemorrhage plan ready (methylergonovine, carboprost, TXA)',
    ],
    complications: [
      'Postpartum hemorrhage / uterine atony',
      'High or total spinal',
      'Failed intubation (higher incidence in obstetric patients)',
      'Aspiration',
      'Amniotic fluid embolism (rare)',
    ],
  },
  {
    key: 'craniotomy',
    label: 'Craniotomy',
    aliases: ['craniotomy', 'crani', 'brain tumor resection', 'clipping'],
    monitors: [
      'Standard ASA monitors',
      'Arterial line (pre-induction if raised ICP or tight hemodynamic control needed)',
      'Large-bore IV access; consider CVC',
      'Consider neuromonitoring depending on lesion location',
    ],
    positioning: [
      'Supine/lateral/prone or sitting depending on approach; head in pins',
      'Pinning is intensely stimulating - deepen anesthetic or infiltrate scalp beforehand',
      'Sitting position carries venous air embolism risk - consider precordial Doppler',
    ],
    anestheticConsiderations: [
      'Goal is a slack brain: maintain CPP, avoid hypercarbia, avoid hypotension and venous congestion',
      'Smooth induction/emergence - avoid coughing and BP swings that raise ICP',
      'Mannitol/hypertonic saline and mild hyperventilation may be requested to reduce brain bulk',
      'Avoid nitrous oxide, particularly with pneumocephalus or sitting position',
      'Plan for a rapid, calm wake-up to allow early neuro exam',
    ],
    complications: [
      'Raised ICP / brain herniation',
      'Venous air embolism (especially sitting position)',
      'Major blood loss from venous sinus injury',
      'Seizures',
      'Delayed emergence complicating neuro assessment',
    ],
  },
];

/**
 * Finds procedure considerations from free text (e.g. the dictated "Planned
 * Surgery/Procedure" field), matching on key, label, or any alias appearing
 * anywhere in the text. Longer aliases win so "laparoscopic cholecystectomy"
 * beats a bare "cholecystectomy" entry.
 */
export function findProcedureByLabelOrAlias(query: string): ProcedureConsiderations | undefined {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return undefined;

  const exact = PROCEDURES.find((p) => p.key === normalized || p.label.toLowerCase() === normalized);
  if (exact) return exact;

  let best: ProcedureConsiderations | undefined;
  let bestAliasLength = 0;
  for (const procedure of PROCEDURES) {
    for (const alias of procedure.aliases) {
      if (normalized.includes(alias) && alias.length > bestAliasLength) {
        best = procedure;
        bestAliasLength = alias.length;
      }
    }
  }
  return best;
}
