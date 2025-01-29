import type { ChangeEventHandler } from "react";

interface Props {
  label?: string;
  name: string;
  defaultChecked?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  className?: string;
}

export function Checkbox({ label, name, required, ...props }: Props) {
  return (
    <label className="fieldset-label">
      {label}
      <input
        type="checkbox"
        className="checkbox"
        id={name}
        name={name}
        required={required}
        {...props}
      />
    </label>
  );
}
