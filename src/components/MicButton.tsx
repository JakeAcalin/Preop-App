import { useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface Props {
  label?: string;
  onTranscriptChange: (finalTranscript: string, interimTranscript: string) => void;
  onStop?: (finalTranscript: string) => void;
}

export default function MicButton({ label = 'Start dictating', onTranscriptChange, onStop }: Props) {
  const { supported, listening, interimTranscript, finalTranscript, start, stop, clear, error } =
    useSpeechRecognition();

  useEffect(() => {
    onTranscriptChange(finalTranscript, interimTranscript);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalTranscript, interimTranscript]);

  if (!supported) {
    return (
      <p className="warning">
        Speech recognition isn't supported in this browser. Try Chrome, Edge, or Safari on your phone, or use manual
        text entry below.
      </p>
    );
  }

  function handleStop() {
    stop();
    onStop?.(finalTranscript);
    clear();
  }

  return (
    <div className="mic-control">
      {!listening ? (
        <button className="primary mic-btn" onClick={start}>
          {'\u{1F3A4}'} {label}
        </button>
      ) : (
        <button className="danger mic-btn" onClick={handleStop}>
          {'⏹'} Stop &amp; process
        </button>
      )}
      {listening && <span className="listening-indicator">Listening...</span>}
      {error && <p className="warning">{error}</p>}
    </div>
  );
}
