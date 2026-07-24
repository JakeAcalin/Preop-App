import { useState } from 'react';
import type { PreopCase } from '../types';
import { FIELDS } from '../data/fields';
import { routeTranscript, appendToValue, type RoutedFragment } from '../data/dictationRouter';
import MicButton from './MicButton';

interface Props {
  preopCase: PreopCase;
  onUpdateCase: (updater: (c: PreopCase) => PreopCase) => void;
}

interface ReviewItem extends RoutedFragment {
  id: string;
}

export default function DictationPanel({ onUpdateCase }: Props) {
  const [liveFinal, setLiveFinal] = useState('');
  const [liveInterim, setLiveInterim] = useState('');
  const [review, setReview] = useState<ReviewItem[] | null>(null);

  function handleStop(finalTranscript: string) {
    if (!finalTranscript.trim()) return;
    const fragments = routeTranscript(finalTranscript);
    setReview(fragments.map((f, i) => ({ ...f, id: `${Date.now()}-${i}` })));
    setLiveFinal('');
    setLiveInterim('');
  }

  function updateReviewField(id: string, fieldId: string | null) {
    setReview((prev) => prev?.map((item) => (item.id === id ? { ...item, fieldId } : item)) ?? null);
  }

  function removeReviewItem(id: string) {
    setReview((prev) => prev?.filter((item) => item.id !== id) ?? null);
  }

  function commitReview() {
    if (!review) return;
    onUpdateCase((c) => {
      const values = { ...c.values };
      const unsorted = [...c.unsorted];
      for (const item of review) {
        if (item.fieldId) {
          const existing = values[item.fieldId];
          values[item.fieldId] = appendToValue(typeof existing === 'string' ? existing : '', item.text);
        } else {
          unsorted.push({ id: item.id, text: item.text, createdAt: Date.now() });
        }
      }
      return { ...c, values, unsorted, updatedAt: Date.now() };
    });
    setReview(null);
  }

  return (
    <div className="dictation-panel">
      <p className="muted">
        Read through the chart and dictate naturally. When you stop, each phrase gets matched to a template field for
        you to confirm before it's saved.
      </p>

      <MicButton
        label="Start dictating case"
        onTranscriptChange={(final, interim) => {
          setLiveFinal(final);
          setLiveInterim(interim);
        }}
        onStop={handleStop}
      />

      {(liveFinal || liveInterim) && (
        <div className="live-transcript">
          <span>{liveFinal}</span> <span className="interim">{liveInterim}</span>
        </div>
      )}

      {review && (
        <div className="review-card">
          <h3>Review before saving</h3>
          {review.length === 0 && <p className="muted">Nothing left to review.</p>}
          <ul className="review-list">
            {review.map((item) => (
              <li key={item.id} className="review-item">
                <p className="review-text">{item.text}</p>
                <div className="review-controls">
                  <select
                    value={item.fieldId ?? ''}
                    onChange={(e) => updateReviewField(item.id, e.target.value || null)}
                  >
                    <option value="">Unsorted (review later)</option>
                    {FIELDS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <button className="small danger" onClick={() => removeReviewItem(item.id)}>
                    Discard
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button className="primary" onClick={commitReview}>
            Save to case
          </button>
        </div>
      )}
    </div>
  );
}
