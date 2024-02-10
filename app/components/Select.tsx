import type { ChangeEventHandler } from "react";

interface SelectOption {
  label: string;
  value: string;
}

interface Props {
  label?: string;
  disabled?: boolean;
  defaultValue?: string;
  value?: string;
  required?: boolean;
  name: string;
  options: SelectOption[];
  onChange?: ChangeEventHandler<HTMLSelectElement>;
}

export function Select({ label, name, options, required, ...props }: Props) {
  return (
    <div className="form-control relative w-full">
      {label && (
        <label htmlFor={name} className="label">
          <span className="label-text">{label}</span>
          {required && (
            <span
              data-testid="required"
              className="label-text-alt absolute right-1 top-9 text-2xl text-error"
            >
              *
            </span>
          )}
        </label>
      )}
      <select
        data-testid="select"
        name={name}
        id={name}
        className="select select-bordered"
        required={required}
        {...props}
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
