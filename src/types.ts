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
  patientLabel: string; // e.g. "Rm 12 - JS" - deliberately not full PHI-identifiable by default
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
