import type { FieldDef } from '../types';
import { phoneticKey, soundsContained } from '../lib/phonetics';

// Merge a new fragment of text into an existing free-text field value.
export function appendToValue(existing: string | undefined, addition: string): string {
  const trimmed = addition.trim();
  if (!existing || existing.trim().length === 0) return trimmed;
  return `${existing.trim()}; ${trimmed}`;
}

const NUMBER_WORDS: Record<string, string> = {
  zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5',
  six: '6', seven: '7', eight: '8', nine: '9', ten: '10',
};

function tokenize(text: string): string[] {
  const raw = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return raw.map((t) => NUMBER_WORDS[t] ?? t);
}

/** Words too generic to count as evidence that an option was meant. */
const STOP_TOKENS = new Set(['a', 'an', 'the', 'of', 'and', 'or', 'with', 'for', 'to', 'x', 'mg', 'kg', 'gtt']);

/** Crude singular form, so "drugs" and "drug" count as the same word. */
function stem(token: string): string {
  return token.length > 3 && token.endsWith('s') ? token.slice(0, -1) : token;
}

function tokenMatches(optionToken: string, textTokens: string[], textKeys: string[]): boolean {
  const stemmed = stem(optionToken);
  if (textTokens.some((t) => stem(t) === stemmed)) return true;
  // Fall back to how it sounds, so "piano" can satisfy "ponv".
  const optionKey = phoneticKey(optionToken);
  return optionKey.length >= 3 && textKeys.includes(optionKey);
}

interface ScoredOption {
  option: string;
  matched: number;
  ratio: number;
}

/**
 * Scores how well dictated text matches an option, by how many of the
 * option's own words appear in the speech (exactly or by sound). Generic
 * words are ignored so "2x PIV + A-line" isn't matched by the word "a".
 */
function scoreOption(option: string, textTokens: string[], textKeys: string[]): ScoredOption {
  const optionTokens = tokenize(option).filter((t) => !STOP_TOKENS.has(t));
  if (optionTokens.length === 0) return { option, matched: 0, ratio: 0 };

  const matched = optionTokens.filter((t) => tokenMatches(t, textTokens, textKeys)).length;
  return { option, matched, ratio: matched / optionTokens.length };
}

function rankOptions(options: string[], text: string): ScoredOption[] {
  const textTokens = tokenize(text);
  const textKeys = textTokens.map((t) => phoneticKey(t));

  return options
    .map((o) => scoreOption(o, textTokens, textKeys))
    .filter((s) => s.matched > 0)
    // Best proportion of the option actually spoken, then most words matched.
    .sort((a, b) => b.ratio - a.ratio || b.matched - a.matched);
}

/** Best single option for the text, or null when nothing is a credible match. */
function matchSingleOption(options: string[], text: string): string | null {
  const ranked = rankOptions(options, text);
  if (ranked.length === 0) {
    // Last resort: the whole option name sounding inside the phrase.
    return options.find((o) => soundsContained(o, text)) ?? null;
  }
  return ranked[0].option;
}

/** Splits dictated speech into the separate things being listed. */
export function splitDictatedList(text: string): string[] {
  return text
    .split(/\s*,\s*|\s+and\s+|\s+plus\s+|\s*;\s*|\s*\/\s*/i)
    .map((part) => part.replace(/^\s*(and|plus|also|with|or)\s+/i, '').trim())
    .filter((part) => part.length > 0);
}

/**
 * Matches every distinct thing mentioned in the text against the option list.
 * Returns the options matched plus any leftover text that matched nothing, so
 * "propofol and fentanyl" becomes two chips rather than one reading
 * "and propofol".
 */
function matchListOptions(options: string[], text: string): { matched: string[]; leftovers: string[] } {
  const segments = splitDictatedList(text);
  const matched: string[] = [];
  const leftovers: string[] = [];

  for (const segment of segments) {
    const best = matchSingleOption(options, segment);
    if (best && !matched.includes(best)) {
      matched.push(best);
    } else if (!best) {
      leftovers.push(segment);
    }
  }

  // Nothing split out cleanly - try the phrase as a whole before giving up.
  if (matched.length === 0 && segments.length === 1) {
    const whole = matchSingleOption(options, text);
    if (whole) return { matched: [whole], leftovers: [] };
  }

  return { matched, leftovers };
}

export type ApplyDictationResult =
  | { kind: 'value'; value: string | string[] }
  | { kind: 'unsorted' };

/**
 * Turns a chunk of dictated (or manually reassigned) text into a value for a
 * specific field, respecting that field's type:
 *  - text/textarea: appended onto the existing free text.
 *  - multiselect: each thing listed is matched against the preset options;
 *    anything unmatched becomes its own custom chip.
 *  - select: best matching option wins; with no credible match the caller is
 *    told nothing was applied so the user can pick, rather than a
 *    single-choice dropdown being filled with unmatched speech.
 */
export function applyDictatedText(
  field: FieldDef,
  existingValue: string | string[] | undefined,
  text: string,
  /** Overrides field.options - used where options depend on the case. */
  options?: string[],
): ApplyDictationResult {
  const trimmed = text.trim();
  const fieldOptions = options ?? field.options ?? [];

  if (!trimmed) {
    return { kind: 'value', value: existingValue ?? (field.type === 'multiselect' ? [] : '') };
  }

  if (field.type === 'select') {
    const match = matchSingleOption(fieldOptions, trimmed);
    return match ? { kind: 'value', value: match } : { kind: 'unsorted' };
  }

  if (field.type === 'multiselect') {
    const existing = Array.isArray(existingValue) ? existingValue : [];
    const { matched, leftovers } = matchListOptions(fieldOptions, trimmed);

    const additions = [...matched, ...leftovers];
    if (additions.length === 0) additions.push(trimmed);

    const merged = [...existing];
    for (const addition of additions) {
      if (!merged.includes(addition)) merged.push(addition);
    }
    return { kind: 'value', value: merged };
  }

  return { kind: 'value', value: appendToValue(typeof existingValue === 'string' ? existingValue : '', trimmed) };
}
