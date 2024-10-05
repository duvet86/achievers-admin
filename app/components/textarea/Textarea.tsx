import type { HTMLInputTypeAttribute } from "react";

import classNames from "classnames";

interface Props {
  name?: string;
  label?: string;
  defaultValue?: string;
  type?: HTMLInputTypeAttribute;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

export function Textarea({
  label,
  name,
  required,
  placeholder,
  ...props
}: Props) {
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
      <textarea
        data-testid="textarea"
        id={name}
        name={name}
        placeholder={placeholder ?? label}
        required={required}
        className="textarea textarea-bordered h-24"
        {...props}
      ></textarea>
    </div>
  );
}
