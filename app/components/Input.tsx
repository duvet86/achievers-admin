import type { HTMLInputTypeAttribute } from "react";

interface Props {
  name: string;
  label: string;
  defaultValue?: string;
  type?: HTMLInputTypeAttribute;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export function Input({
  label,
  name,
  type = "text",
  required,
  ...props
}: Props) {
  return (
    <div className="form-control relative w-full">
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
      <input
        data-testid="textinput"
        type={type}
        id={name}
        name={name}
        placeholder={label}
        required={required}
        className="input-bordered input w-full"
        {...props}
      />
    </div>
  );
}
