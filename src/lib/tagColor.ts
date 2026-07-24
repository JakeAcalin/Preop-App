// Deterministic pastel color per tag label, purely cosmetic (mirrors the
// colored chip look from the original template).
const PALETTE = [
  { bg: '#dbeafe', fg: '#1e3a8a' }, // blue
  { bg: '#fee2e2', fg: '#7f1d1d' }, // red
  { bg: '#dcfce7', fg: '#14532d' }, // green
  { bg: '#ffedd5', fg: '#7c2d12' }, // orange
  { bg: '#cffafe', fg: '#164e63' }, // teal
  { bg: '#fce7f3', fg: '#831843' }, // pink
  { bg: '#ede9fe', fg: '#4c1d95' }, // purple
  { bg: '#fef9c3', fg: '#713f12' }, // yellow
];

export function colorForTag(text: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
