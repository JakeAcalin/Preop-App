import type { ProcedureConsiderations } from '../types';

interface Props {
  procedure: ProcedureConsiderations;
  /** Shown when the procedure was inferred from dictated text rather than picked. */
  inferred?: boolean;
}

function NoteList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <>
      <h5>{title}</h5>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}

export default function ProcedureNotes({ procedure, inferred }: Props) {
  return (
    <div className="card procedure-card">
      <h3>Anesthetic considerations - {procedure.label}</h3>
      <p className="muted small">
        {inferred ? 'Matched from the procedure you dictated. ' : ''}
        Reference notes you've curated for this procedure type - review/edit in the knowledge base, not a live external
        lookup.
      </p>

      <NoteList title="Monitors" items={procedure.monitors} />
      <NoteList title="Positioning" items={procedure.positioning} />
      <NoteList title="Anesthetic considerations" items={procedure.anestheticConsiderations} />
      <NoteList title="Potential complications" items={procedure.complications} />
      <NoteList title="Equipment / other" items={procedure.equipment ?? []} />
    </div>
  );
}
