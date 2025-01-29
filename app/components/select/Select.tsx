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
    <>
      <label htmlFor={name} className="fieldset-label">
        {label}
      </label>
      <select
        name={name}
        id={name}
        className={classNames("select w-full", {
          validator: required,
        })}
        required={required}
        {...props}
      >
        {options.map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </>
  );
}
