import { useCallback, useEffect, useRef, useState } from 'react';

// Minimal ambient typing for the Web Speech API (not in lib.dom.d.ts).
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

interface UseVoiceSessionOptions {
  /** Called for each finalised chunk of speech, as soon as it's recognised. */
  onFinalChunk: (text: string) => void;
}

interface UseVoiceSessionResult {
  supported: boolean;
  listening: boolean;
  interim: string;
  error: string | null;
  start: () => void;
  stop: () => void;
}

/**
 * A long-running dictation session for hands-free entry.
 *
 * Two things make this different from a one-shot recogniser: results are
 * delivered chunk by chunk as you speak (rather than accumulating into one
 * huge transcript that's only processed at the end), and the session
 * automatically restarts when the browser ends it after a pause - mobile
 * Chrome/Safari stop listening after a few seconds of silence, which
 * otherwise looks like the mic silently freezing mid-case.
 */
export function useVoiceSession({ onFinalChunk }: UseVoiceSessionOptions): UseVoiceSessionResult {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  // Whether the user wants to be listening - drives auto-restart after the
  // browser ends a recognition run on its own.
  const wantListeningRef = useRef(false);
  const onFinalChunkRef = useRef(onFinalChunk);
  onFinalChunkRef.current = onFinalChunk;

  const supported = isSpeechRecognitionSupported();

  const startRecognition = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          const trimmed = transcript.trim();
          if (trimmed) onFinalChunkRef.current(trimmed);
        } else {
          interimText += transcript;
        }
      }
      setInterim(interimText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      // "no-speech" and "aborted" are routine during a long session; the
      // onend handler restarts us, so don't surface them as failures.
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        wantListeningRef.current = false;
        setError('Microphone access was blocked. Allow mic access for this site, then try again.');
        setListening(false);
        return;
      }
      setError(`Microphone error (${event.error}).`);
    };

    recognition.onend = () => {
      setInterim('');
      if (wantListeningRef.current) {
        // Browser ended the run (usually a silence timeout) but the user is
        // still dictating - pick straight back up.
        try {
          recognition.start();
        } catch {
          setListening(false);
          wantListeningRef.current = false;
        }
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
      setError(null);
    } catch {
      setError('Could not start the microphone. Close other tabs using it and try again.');
      setListening(false);
    }
  }, []);

  const start = useCallback(() => {
    if (wantListeningRef.current) return;
    wantListeningRef.current = true;
    startRecognition();
  }, [startRecognition]);

  const stop = useCallback(() => {
    wantListeningRef.current = false;
    recognitionRef.current?.stop();
    setListening(false);
    setInterim('');
  }, []);

  useEffect(() => {
    return () => {
      wantListeningRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  return { supported, listening, interim, error, start, stop };
}
