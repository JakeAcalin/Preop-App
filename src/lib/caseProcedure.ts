import { PROCEDURES, findProcedureByLabelOrAlias } from '../data/procedures';
import type { PreopCase, ProcedureConsiderations } from '../types';

/**
 * Resolves which procedure's considerations apply to a case. Prefers an
 * explicit selection, then falls back to matching whatever was dictated into
 * the "Planned Surgery/Procedure" field - so saying "lap chole" is enough to
 * surface the insufflation notes without touching a dropdown.
 */
export function resolveCaseProcedure(preopCase: PreopCase): ProcedureConsiderations | undefined {
  if (preopCase.procedureType) {
    const selected = PROCEDURES.find((p) => p.key === preopCase.procedureType);
    if (selected) return selected;
  }

  const dictated = preopCase.values.plannedProcedure;
  if (typeof dictated === 'string' && dictated.trim()) {
    return findProcedureByLabelOrAlias(dictated);
  }

  return undefined;
}
