import type { HTMLInputTypeAttribute } from "react";

interface Props {
  name: string;
  label: string;
  defaultValue: string;
  type?: HTMLInputTypeAttribute;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export default function Input({
  label,
  name,
  defaultValue,
  type = "text",
  readOnly,
  disabled,
  required,
}: Props) {
  return (
    <div className="form-control w-full">
      <label htmlFor={name} className="label">
        <span className="label-text">{label}</span>
      </label>
      <input
        type={type}
        id={name}
        name={name}
        placeholder={label}
        className="input-bordered input w-full"
        defaultValue={defaultValue}
        readOnly={readOnly}
        disabled={disabled || readOnly}
        required={required}
      />
    </div>
  );
}
