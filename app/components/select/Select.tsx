import type { ChangeEventHandler } from "react";

import classNames from "classnames";

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
        </label>
      )}
      {required && (
        <span
          data-testid="required"
          className={classNames(
            "label-text-alt absolute right-1 text-2xl text-error",
            {
              "top-0": label === undefined,
              "top-9": label !== undefined,
            },
          )}
        >
          *
        </span>
      )}
      <select
        data-testid="select"
        name={name}
        id={name}
        className="select select-bordered"
        required={required}
        {...props}
      >
        {options.map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
