import type { PatientWeights } from '../lib/weights';

interface Props {
  weights: PatientWeights;
  /** Fills the template's IBW/BMI fields from the calculated values. */
  onFillDerived: (ibwKg: number | undefined, bmi: number | undefined) => void;
  ibwFieldFilled: boolean;
  bmiFieldFilled: boolean;
}

function kg(value: number | undefined): string {
  return value === undefined ? '-' : `${Math.round(value * 10) / 10} kg`;
}

export default function WeightsCard({ weights, onFillDerived, ibwFieldFilled, bmiFieldFilled }: Props) {
  const { tbwKg, ibwKg, lbwKg, adjBwKg, bmi, heightCm, sex } = weights;

  if (tbwKg === undefined) {
    return (
      <div className="card">
        <h4>Dosing weights</h4>
        <p className="muted small">
          Enter TBW (kg) above to calculate drug doses. Add height and sex (in Demographics, e.g. "68F") to also get
          ideal and lean body weight.
        </p>
      </div>
    );
  }

  const canFill = (ibwKg !== undefined && !ibwFieldFilled) || (bmi !== undefined && !bmiFieldFilled);

  return (
    <div className="card">
      <h4>Dosing weights</h4>
      <dl className="summary-dl">
        <div className="summary-row">
          <dt>Actual (TBW)</dt>
          <dd>{kg(tbwKg)}</dd>
        </div>
        <div className="summary-row">
          <dt>Ideal (IBW)</dt>
          <dd>{kg(ibwKg)}</dd>
        </div>
        <div className="summary-row">
          <dt>Lean (LBW)</dt>
          <dd>{kg(lbwKg)}</dd>
        </div>
        <div className="summary-row">
          <dt>Adjusted (AdjBW)</dt>
          <dd>{kg(adjBwKg)}</dd>
        </div>
        <div className="summary-row">
          <dt>BMI</dt>
          <dd>{bmi === undefined ? '-' : Math.round(bmi * 10) / 10}</dd>
        </div>
      </dl>

      {(heightCm === undefined || sex === undefined) && (
        <p className="muted small">
          {heightCm === undefined && 'Add height'}
          {heightCm === undefined && sex === undefined && ' and '}
          {sex === undefined && 'note sex in Demographics (e.g. "68F")'}
          {' '}to calculate IBW/LBW.
        </p>
      )}

      {canFill && (
        <button className="small" onClick={() => onFillDerived(ibwKg, bmi)}>
          Fill IBW &amp; BMI fields
        </button>
      )}
    </div>
  );
}
