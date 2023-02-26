import type { HTMLInputTypeAttribute } from "react";

export interface Props {
  name: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  readOnly?: boolean;
}

export default function Input({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
  readOnly = false,
}: Props) {
  return (
    <div className="form-control w-full max-w-xs">
      <label htmlFor={name} className="label">
        <span className="label-text">{label}</span>
      </label>
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        className="input-bordered input w-full max-w-xs"
        defaultValue={defaultValue}
        readOnly={readOnly}
      />
    </div>
  );
}
