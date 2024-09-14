import type { ChangeEventHandler } from "react";

import classNames from "classnames";

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

export function Checkbox({
  label,
  name,
  required,
  className,
  ...props
}: Props) {
  return (
    <div className={classNames("form-control relative", className)}>
      <label
        htmlFor={name}
        className="label cursor-pointer flex-col items-start"
      >
        {label && <span className="label-text mb-1">{label}</span>}
        {required && (
          <span
            data-testid="required"
            className="label-text-alt absolute bottom-2 left-8 text-2xl text-error"
          >
            *
          </span>
        )}
        <input
          type="checkbox"
          className="checkbox"
          id={name}
          name={name}
          required={required}
          {...props}
        />
      </label>
    </div>
  );
}
