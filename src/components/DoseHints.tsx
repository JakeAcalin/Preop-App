import type { CalculatedDrug } from '../lib/doseCalc';

interface Props {
  drugs: CalculatedDrug[];
}

export default function DoseHints({ drugs }: Props) {
  if (drugs.length === 0) return null;

  return (
    <div className="dose-hints">
      {drugs.map((drug) => (
        <div className="dose-hint" key={`${drug.source}-${drug.label}`}>
          <div className="dose-hint-drug">{drug.label}</div>
          {drug.lines.map((line, i) => (
            <div className={line.highlighted ? 'dose-line selected' : 'dose-line'} key={i}>
              <div className="dose-line-main">
                <span className="dose-line-indication">{line.indication ?? 'Dose'}</span>
                <span className="dose-line-value">
                  {line.dose}
                  {line.capped && <span className="dose-capped"> max</span>}
                </span>
              </div>
              {line.detail && <div className="dose-line-detail">{line.detail}</div>}
              {line.note && <div className="dose-line-note">{line.note}</div>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
