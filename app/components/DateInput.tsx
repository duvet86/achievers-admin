interface Props {
  name: string;
  label: string;
  defaultValue: Date | string;
  readOnly?: boolean;
  required?: boolean;
}

export default function DateInput({
  label,
  name,
  defaultValue,
  readOnly,
  required,
}: Props) {
  const value =
    defaultValue instanceof Date
      ? defaultValue.toISOString().substring(0, 10)
      : defaultValue;

  return (
    <div className="form-control w-full">
      <label htmlFor={name} className="label">
        <span className="label-text">{label}</span>
      </label>
      <input
        type="date"
        id={name}
        name={name}
        placeholder={label}
        className="input-bordered input w-full"
        defaultValue={value}
        readOnly={readOnly}
        required={required}
      />
    </div>
  );
}
