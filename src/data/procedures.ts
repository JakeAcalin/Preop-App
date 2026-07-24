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
    aliases: ['lap chole', 'laparoscopic cholecystectomy', 'cholecystectomy'],
    monitors: ['Standard ASA monitors'],
    positioning: ['Supine, reverse Trendelenburg once pneumoperitoneum established'],
    anestheticConsiderations: [
      'GA with ETT typical (aspiration risk with pneumoperitoneum)',
      'CO2 insufflation causes hypercarbia, increased peak airway pressures, decreased venous return on Trendelenburg-reversal changes',
      'PONV prophylaxis important - high-risk case for PONV',
      'Consider TAP block/local infiltration for multimodal analgesia',
    ],
    complications: [
      'CO2 embolism (rare)',
      'Pneumothorax/subcutaneous emphysema',
      'Vagal bradycardia with peritoneal insufflation',
      'Bile duct/vascular injury requiring conversion to open',
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
];

export function findProcedureByLabelOrAlias(query: string): ProcedureConsiderations | undefined {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return undefined;
  return PROCEDURES.find(
    (p) =>
      p.key === normalized ||
      p.label.toLowerCase() === normalized ||
      p.aliases.some((a) => normalized.includes(a)),
  );
}
