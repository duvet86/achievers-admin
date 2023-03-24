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

export default function Textarea({
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
      <textarea
        id={name}
        name={name}
        placeholder={label}
        required={required}
        className="textarea-bordered textarea h-24"
        {...props}
      ></textarea>
    </div>
  );
}
