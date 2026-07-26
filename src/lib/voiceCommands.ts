export type VoiceCommand = 'next' | 'back' | 'skip' | 'clear' | 'stop' | 'finish';

// Spoken phrases that drive navigation instead of being entered as content.
// Longest phrases first so "next field" wins over "next".
const COMMAND_PHRASES: readonly { readonly phrase: string; readonly command: VoiceCommand }[] = ([
  { phrase: 'next field', command: 'next' },
  { phrase: 'next box', command: 'next' },
  { phrase: 'next question', command: 'next' },
  { phrase: 'move on', command: 'next' },
  { phrase: 'next', command: 'next' },

  { phrase: 'previous field', command: 'back' },
  { phrase: 'go back', command: 'back' },
  { phrase: 'previous', command: 'back' },
  { phrase: 'back', command: 'back' },

  { phrase: 'skip this', command: 'skip' },
  { phrase: 'skip', command: 'skip' },

  { phrase: 'clear field', command: 'clear' },
  { phrase: 'clear that', command: 'clear' },
  { phrase: 'delete that', command: 'clear' },
  { phrase: 'scratch that', command: 'clear' },
  { phrase: 'clear', command: 'clear' },

  { phrase: 'stop listening', command: 'stop' },
  { phrase: 'stop dictation', command: 'stop' },
  { phrase: 'pause dictation', command: 'stop' },
  { phrase: 'pause', command: 'stop' },

  { phrase: 'finish checklist', command: 'finish' },
  { phrase: 'end walkthrough', command: 'finish' },
  { phrase: 'all done', command: 'finish' },
  { phrase: 'finish', command: 'finish' },
] as { phrase: string; command: VoiceCommand }[]).sort((a, b) => b.phrase.length - a.phrase.length);

export interface ParsedSpeech {
  /** Content to enter into the current field (may be empty). */
  content: string;
  /** Command spoken at the end of the chunk, if any. */
  command: VoiceCommand | null;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits a chunk of recognised speech into field content plus an optional
 * trailing navigation command, so you can say
 * "hypertension and diabetes, next" without stopping to tap.
 *
 * A command only counts when it's the whole chunk or sits at the very end -
 * "next" in the middle of a sentence stays part of the dictated content.
 */
export function parseSpeech(raw: string): ParsedSpeech {
  const normalized = normalize(raw);
  if (!normalized) return { content: '', command: null };

  for (const { phrase, command } of COMMAND_PHRASES) {
    if (normalized === phrase) {
      return { content: '', command };
    }
    const suffix = ` ${phrase}`;
    if (normalized.endsWith(suffix)) {
      const contentEnd = normalized.length - suffix.length;
      // Map back onto the raw text so original casing/decimals survive.
      const content = raw.trim().slice(0, sliceIndexForNormalized(raw.trim(), contentEnd)).trim();
      return { content, command };
    }
  }

  return { content: raw.trim(), command: null };
}

/**
 * Normalising collapses whitespace/punctuation, so an index into the
 * normalised string doesn't line up with the raw one. Walk both together to
 * find where the trailing command starts in the raw text.
 */
function sliceIndexForNormalized(raw: string, normalizedIndex: number): number {
  let seen = 0;
  let lastWasSpace = false;
  for (let i = 0; i < raw.length; i++) {
    if (seen >= normalizedIndex) return i;
    const char = raw[i];
    const isSeparator = /[\s.,!?;:]/.test(char);
    if (isSeparator) {
      if (!lastWasSpace && seen > 0) {
        seen += 1;
        lastWasSpace = true;
      }
    } else {
      seen += 1;
      lastWasSpace = false;
    }
  }
  return raw.length;
}
