// Phonetic matching for dictated text.
//
// Speech recognition returns words that *sound* like what was said but are
// spelled nothing like it - "high piano V" for "high PONV risk", "Two" for
// "ASA 2". Edit distance can't bridge that, so options are also compared on a
// consonant skeleton: a metaphone-style key that keeps the sounds and drops
// the spelling.

/** Digit words the recognizer writes out, so "ASA two" can match "ASA 2". */
const NUMBER_WORDS: Record<string, string> = {
  zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5',
  six: '6', seven: '7', eight: '8', nine: '9', ten: '10',
};

function normalizeWord(word: string): string {
  const lower = word.toLowerCase();
  return NUMBER_WORDS[lower] ?? lower;
}

/**
 * Reduces a word to the sounds that survive mis-recognition: digits are kept
 * verbatim, vowels are dropped except a leading one, and consonants that are
 * commonly confused collapse together (c/k/q, s/z, f/ph/v, d/t, m/n, g/j).
 */
export function phoneticKey(text: string): string {
  const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];

  return words
    .map(normalizeWord)
    .map((word) => {
      if (/^\d+$/.test(word)) return word;

      const collapsed = word
        .replace(/ph/g, 'f')
        .replace(/ck/g, 'k')
        .replace(/[cq]/g, 'k')
        .replace(/x/g, 'ks')
        .replace(/z/g, 's')
        .replace(/v/g, 'f')
        .replace(/j/g, 'g')
        .replace(/y/g, 'i')
        .replace(/w/g, 'u')
        .replace(/h/g, '');

      const leadingVowel = /^[aeiou]/.test(collapsed) ? collapsed[0] : '';
      const consonants = collapsed.replace(/[aeiou]/g, '');
      const deduped = consonants.replace(/(.)\1+/g, '$1');
      return leadingVowel + deduped;
    })
    .filter(Boolean)
    .join('');
}

/** True when two strings reduce to the same sounds. */
export function soundsLike(a: string, b: string): boolean {
  const keyA = phoneticKey(a);
  const keyB = phoneticKey(b);
  return keyA.length > 0 && keyA === keyB;
}

/**
 * True when `haystack` contains `needle`'s sounds - used so "we'll reverse
 * with sugammadex" still matches the "Sugammadex" option.
 */
export function soundsContained(needle: string, haystack: string): boolean {
  const needleKey = phoneticKey(needle);
  if (needleKey.length < 3) return false;
  return phoneticKey(haystack).includes(needleKey);
}
