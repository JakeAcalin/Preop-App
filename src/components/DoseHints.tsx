import type { CalculatedDose } from '../lib/doseCalc';

interface Props {
  doses: CalculatedDose[];
}

export default function DoseHints({ doses }: Props) {
  if (doses.length === 0) return null;

  return (
    <div className="dose-hints">
      {doses.map((d) => (
        <div className="dose-hint" key={`${d.source}-${d.label}`}>
          <div className="dose-hint-main">
            <span className="dose-hint-label">{d.label}</span>
            <span className="dose-hint-value">
              {d.dose}
              {d.capped && <span className="dose-capped"> (max)</span>}
            </span>
          </div>
          {d.basis && <div className="dose-hint-basis">{d.basis}</div>}
          {d.note && <div className="dose-hint-note">{d.note}</div>}
        </div>
      ))}
    </div>
  );
}
