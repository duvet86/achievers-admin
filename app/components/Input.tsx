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
          <span className="label-text-alt absolute top-9 right-1 text-2xl text-error">
            *
          </span>
        )}
      </label>
      <input
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
