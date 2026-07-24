import type { FieldDef } from '../types';

interface Props {
  field: FieldDef;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
}

export default function FieldInput({ field, value, onChange }: Props) {
  if (field.type === 'textarea') {
    return (
      <textarea
        rows={3}
        value={(value as string) ?? ''}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (field.type === 'select') {
    return (
      <select value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">-- not set --</option>
        {field.options?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'multiselect') {
    const values = (value as string[]) ?? [];
    return (
      <div className="multiselect">
        {field.options?.map((opt) => (
          <label key={opt} className="checkbox-option">
            <input
              type="checkbox"
              checked={values.includes(opt)}
              onChange={(e) => {
                if (e.target.checked) onChange([...values, opt]);
                else onChange(values.filter((v) => v !== opt));
              }}
            />
            {opt}
          </label>
        ))}
      </div>
    );
  }

  return (
    <input
      type="text"
      value={(value as string) ?? ''}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
