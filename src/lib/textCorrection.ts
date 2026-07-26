import { MEDICAL_VOCAB, FILLER_WORDS } from '../data/medicalVocab';

// --- Lookup tables built once from the vocabulary ---

interface PhraseRule {
  pattern: RegExp;
  display: string;
}

/** Multi-word mis-hearings ("rock uranium" -> "Rocuronium"), longest first. */
const PHRASE_RULES: PhraseRule[] = MEDICAL_VOCAB.flatMap((entry) =>
  (entry.variants ?? [])
    .filter((v) => v.includes(' '))
    .map((variant) => ({ variant, display: entry.display })),
)
  .sort((a, b) => b.variant.length - a.variant.length)
  .map(({ variant, display }) => ({
    pattern: new RegExp(`\\b${escapeRegExp(variant)}\\b`, 'gi'),
    display,
  }));

/** Single-word variant -> canonical display. */
const WORD_VARIANTS = new Map<string, string>();
/** Canonical lowercase term -> display form (for casing fixes + fuzzy targets). */
const CANONICAL_WORDS = new Map<string, string>();

for (const entry of MEDICAL_VOCAB) {
  const displayLower = entry.display.toLowerCase();
  if (!entry.display.includes(' ')) {
    CANONICAL_WORDS.set(displayLower, entry.display);
  }
  for (const variant of entry.variants ?? []) {
    if (!variant.includes(' ')) {
      WORD_VARIANTS.set(variant.toLowerCase(), entry.display);
    }
  }
}

/** Multi-word canonical terms, so correct phrasing still gets canonical casing. */
const CANONICAL_PHRASES: PhraseRule[] = MEDICAL_VOCAB.filter((e) => e.display.includes(' '))
  .sort((a, b) => b.display.length - a.display.length)
  .map((entry) => ({
    pattern: new RegExp(`\\b${escapeRegExp(entry.display)}\\b`, 'gi'),
    display: entry.display,
  }));

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// --- Fuzzy matching ---

/** Levenshtein distance with early exit once `max` is exceeded. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      rowMin = Math.min(rowMin, curr[j]);
    }
    if (rowMin > max) return max + 1;
    prev = curr;
  }
  return prev[b.length];
}

/** Distance tolerated for a word of this length - stricter for short words. */
function toleranceFor(word: string): number {
  if (word.length <= 4) return 0;
  if (word.length <= 6) return 1;
  if (word.length <= 10) return 2;
  return 3;
}

function fuzzyMatchWord(word: string): string | null {
  const tolerance = toleranceFor(word);
  if (tolerance === 0) return null;

  let best: string | null = null;
  let bestDistance = tolerance + 1;
  for (const [canonical, display] of CANONICAL_WORDS) {
    const distance = editDistance(word, canonical, tolerance);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = display;
    }
  }
  return bestDistance <= tolerance ? best : null;
}

// --- Cleanup passes ---

function stripFillers(text: string): string {
  let out = text;
  for (const filler of FILLER_WORDS) {
    out = out.replace(new RegExp(`\\b${escapeRegExp(filler)}\\b`, 'gi'), ' ');
  }
  return out;
}

/**
 * Speech recognizers spell out numbers inconsistently; normalise the small
 * ones that show up in classifications ("ASA three" -> "ASA 3").
 */
const NUMBER_WORDS: Record<string, string> = {
  one: '1', two: '2', three: '3', four: '4', five: '5', six: '6',
};

function normalizeClassNumbers(text: string): string {
  return text.replace(
    /\b(asa|mallampati|class)\s+(one|two|three|four|five|six)\b/gi,
    (_m, label: string, word: string) => `${label} ${NUMBER_WORDS[word.toLowerCase()]}`,
  );
}

function capitalizeSentences(text: string): string {
  return text.replace(/(^|[.!?]\s+)([a-z])/g, (_m, prefix: string, letter: string) => prefix + letter.toUpperCase());
}

/**
 * Cleans up a chunk of dictated text: fixes known medical mis-hearings,
 * fuzzy-corrects remaining garbled words against the medical vocabulary,
 * strips filler words, and tidies casing/spacing.
 *
 * Only words that are close to a known medical term are touched - ordinary
 * English is left alone, so this won't "correct" words it doesn't recognise.
 */
export function correctMedicalText(raw: string): string {
  if (!raw.trim()) return '';

  let text = ` ${raw} `;

  // 1. Multi-word mis-hearings first (longest match wins).
  for (const rule of PHRASE_RULES) {
    text = text.replace(rule.pattern, rule.display);
  }

  // 2. Word-level corrections: explicit variants, then fuzzy fallback.
  text = text.replace(/[A-Za-z][A-Za-z'-]*/g, (word) => {
    const lower = word.toLowerCase();

    // A word that is itself a canonical term is never rewritten - otherwise a
    // term that doubles as another entry's variant (e.g. "ASA") gets replaced.
    const canonical = CANONICAL_WORDS.get(lower);
    if (canonical) return canonical;

    const variant = WORD_VARIANTS.get(lower);
    if (variant) return variant;

    return fuzzyMatchWord(lower) ?? word;
  });

  // 3. Canonical casing for correctly-heard multi-word terms.
  for (const rule of CANONICAL_PHRASES) {
    text = text.replace(rule.pattern, rule.display);
  }

  // 4. Tidy up.
  text = normalizeClassNumbers(text);
  text = stripFillers(text);
  text = text.replace(/\s+([,.;:])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  text = capitalizeSentences(text);

  return text;
}
