import type { HTMLInputTypeAttribute } from "react";

import { Xmark } from "iconoir-react";

interface Props {
  name: string;
  placeholder?: string;
  label?: string;
  defaultValue?: string;
  type?: HTMLInputTypeAttribute;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  hasButton?: boolean;
  onButtonClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function Input({
  label,
  placeholder,
  name,
  type = "text",
  required,
  hasButton,
  onButtonClick,
  disabled,
  ...props
}: Props) {
  return (
    <div className="form-control relative w-full">
      {label && (
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
      )}
      <div className="join">
        <input
          data-testid="textinput"
          type={type}
          id={name}
          name={name}
          placeholder={placeholder ?? label}
          required={required}
          className="input join-item input-bordered w-full"
          disabled={disabled}
          {...props}
        />

        {hasButton && (
          <button
            type="button"
            className="btn btn-square join-item"
            onClick={onButtonClick}
            disabled={disabled}
          >
            <Xmark />
          </button>
        )}
      </div>
    </div>
  );
}
