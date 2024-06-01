import type { HTMLInputTypeAttribute } from "react";

interface Props {
  name: string;
  label: string;
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
