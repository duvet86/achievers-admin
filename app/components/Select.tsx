interface SelectOption {
  label: string;
  value: string;
}

interface Props {
  label?: string;
  disabled?: boolean;
  defaultValue?: string;
  required?: boolean;
  name: string;
  options: SelectOption[];
}

export default function Select({ label, name, defaultValue, options }: Props) {
  return (
    <div className="form-control w-full">
      <label htmlFor={name} className="label">
        <span className="label-text">{label}</span>
      </label>
      <select
        name={name}
        id={name}
        className="select-bordered select"
        defaultValue={defaultValue}
      >
        {options.map(({ label, value }, index) => (
          <option key={index} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
