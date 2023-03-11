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

export default function Input({ label, name, type = "text", ...props }: Props) {
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
        {...props}
      />
    </div>
  );
}
