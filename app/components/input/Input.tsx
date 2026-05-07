import type { RefObject } from "react";

import classNames from "classnames";
import { Xmark } from "iconoir-react";
import { useRef } from "react";

interface Props extends React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> {
  label?: string;
  hasButton?: boolean;
  onButtonClick?: (inputRef: RefObject<HTMLInputElement | null>) => void;
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
  const inputRef = useRef<HTMLInputElement>(null);

  const onButtonClickInternal = () => {
    if (onButtonClick) {
      onButtonClick(inputRef);
    }
  };

  return (
    <>
      <label htmlFor={name} className="fieldset-label">
        {label}
      </label>
      <div className="indicator w-full">
        {required && (
          <span className="indicator-item badge text-error text-xl">*</span>
        )}
        <div
          className={classNames("w-full", {
            join: hasButton,
          })}
        >
          <input
            ref={inputRef}
            type={type}
            id={name}
            name={name}
            placeholder={placeholder ?? label}
            required={required}
            disabled={disabled}
            className={classNames("input w-full", {
              validator: required,
              "join-item": hasButton,
            })}
            {...props}
          />
          {hasButton && (
            <button
              type="button"
              className="btn btn-neutral join-item"
              onClick={onButtonClickInternal}
              disabled={disabled}
            >
              <Xmark />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
