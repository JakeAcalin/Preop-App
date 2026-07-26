import type { FieldDef } from '../types';

// Merge a new fragment of text into an existing free-text field value.
export function appendToValue(existing: string | undefined, addition: string): string {
  const trimmed = addition.trim();
  if (!existing || existing.trim().length === 0) return trimmed;
  return `${existing.trim()}; ${trimmed}`;
}

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

// An option "matches" dictated text if every token of the option (e.g. "ASA 3"
// -> ["asa", "3"], "Pulse Ox" -> ["pulse", "ox"]) appears somewhere in the
// dictated text. This tolerates filler words around the option ("ASA class is
// a 3") without false-matching on partial overlaps.
function optionMatchesTokens(option: string, textTokens: string[]): boolean {
  const optionTokens = tokenize(option);
  return optionTokens.length > 0 && optionTokens.every((t) => textTokens.includes(t));
}

function matchSingleOption(options: string[], text: string): string | null {
  const textTokens = tokenize(text);
  const matches = options.filter((o) => optionMatchesTokens(o, textTokens));
  if (matches.length === 0) return null;
  // Prefer the most specific (most-token) match when several options match.
  matches.sort((a, b) => tokenize(b).length - tokenize(a).length);
  return matches[0];
}

function matchAllOptions(options: string[], text: string): string[] {
  const textTokens = tokenize(text);
  return options.filter((o) => optionMatchesTokens(o, textTokens));
}

export type ApplyDictationResult =
  | { kind: 'value'; value: string | string[] }
  | { kind: 'unsorted' };

/**
 * Turns a chunk of dictated (or manually reassigned) text into a value for a
 * specific field, respecting that field's type:
 *  - text/textarea: appended onto the existing free text.
 *  - multiselect: matched against the preset option list (token-based); any
 *    match is added as a chip, and if nothing matches the raw text is added
 *    as a custom chip (mirrors the manual "Add custom" chip picker input) -
 *    this never produces anything but a string[], so it's always safe for
 *    the chip UI to render.
 *  - select: matched against the option list; only a confident match is
 *    applied. With no match the caller is told nothing was applied, so the
 *    user can pick the right option rather than having a single-choice
 *    dropdown filled with unmatched text.
 */
export function applyDictatedText(
  field: FieldDef,
  existingValue: string | string[] | undefined,
  text: string,
): ApplyDictationResult {
  const trimmed = text.trim();
  if (!trimmed) return { kind: 'value', value: existingValue ?? (field.type === 'multiselect' ? [] : '') };

  if (field.type === 'select') {
    const match = matchSingleOption(field.options ?? [], trimmed);
    return match ? { kind: 'value', value: match } : { kind: 'unsorted' };
  }

  if (field.type === 'multiselect') {
    const existing = Array.isArray(existingValue) ? existingValue : [];
    const matches = matchAllOptions(field.options ?? [], trimmed);
    const additions = matches.length > 0 ? matches : [trimmed];
    const merged = [...existing];
    for (const addition of additions) {
      if (!merged.includes(addition)) merged.push(addition);
    }
    return { kind: 'value', value: merged };
  }

  return { kind: 'value', value: appendToValue(typeof existingValue === 'string' ? existingValue : '', trimmed) };
}
