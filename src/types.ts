// Core data model for a single preop case.
// Field values are deliberately loose (string) for text/textarea/select,
// and string[] for multiselect, so the dictation router and manual inputs
// can share the same shape.

export type FieldType = 'text' | 'textarea' | 'select' | 'multiselect' | 'number';

export interface FieldDef {
  id: string;
  label: string;
  section: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  /** Keywords/phrases used by the dictation router to detect this field in free speech. */
  keywords: string[];
  /** Appends any infusion selected elsewhere in the case to this field's options. */
  includeCaseInfusions?: boolean;
}

export interface SectionDef {
  id: string;
  label: string;
}

export type FieldValues = Record<string, string | string[]>;

export interface UnsortedNote {
  id: string;
  text: string;
  createdAt: number;
}

export interface PreopCase {
  id: string;
  createdAt: number;
  updatedAt: number;
  /** Date of surgery as "YYYY-MM-DD" - usually the day after you preop it. */
  caseDate: string;
  /** Nth case on that date, used to build the default label. */
  caseNumber: number;
  /** Optional override; when unset the label is derived from caseDate/caseNumber. */
  customLabel?: string;
  /**
   * Which rotation the case fell in. Describes your schedule rather than the
   * patient's encounter, so it survives de-identification and still tells you
   * roughly when a case happened.
   */
  rotation?: string;
  procedureType: string; // key into procedure knowledge base, or freetext if no match
  values: FieldValues;
  unsorted: UnsortedNote[];
}

export interface ProcedureConsiderations {
  key: string;
  label: string;
  aliases: string[];
  monitors: string[];
  positioning: string[];
  anestheticConsiderations: string[];
  complications: string[];
  equipment?: string[];
  notes?: string;
}
