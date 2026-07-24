import { useState } from 'react';
import type { FieldDef } from '../types';
import { colorForTag } from '../lib/tagColor';

interface Props {
  field: FieldDef;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
}

function TagPicker({ field, value, onChange }: Props) {
  const [customText, setCustomText] = useState('');
  const values = Array.isArray(value) ? value : [];
  const remainingOptions = (field.options ?? []).filter((opt) => !values.includes(opt));

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
  }

  function removeTag(tag: string) {
    onChange(values.filter((v) => v !== tag));
  }

  return (
    <div className="tag-picker">
      {values.length > 0 && (
        <div className="tag-list">
          {values.map((tag) => {
            const c = colorForTag(tag);
            return (
              <span key={tag} className="tag-chip" style={{ background: c.bg, color: c.fg }}>
                {tag}
                <button
                  type="button"
                  className="tag-remove"
                  style={{ color: c.fg }}
                  onClick={() => removeTag(tag)}
                  aria-label={`Remove ${tag}`}
                >
                  {'×'}
                </button>
              </span>
            );
          })}
        </div>
      )}
      {remainingOptions.length > 0 && (
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) addTag(e.target.value);
          }}
        >
          <option value="">+ Add from list...</option>
          {remainingOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}
      <div className="tag-custom-add">
        <input
          type="text"
          placeholder="Add custom..."
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag(customText);
              setCustomText('');
            }
          }}
        />
        <button
          type="button"
          className="small"
          onClick={() => {
            addTag(customText);
            setCustomText('');
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
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
    return <TagPicker field={field} value={value} onChange={onChange} />;
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
