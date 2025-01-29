import type { HTMLInputTypeAttribute } from "react";

import classNames from "classnames";

interface Props {
  name?: string;
  label?: string;
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
    <>
      <label className="fieldset-label">{label}</label>
      <div className="indicator w-full">
        {required && (
          <span className="indicator-item badge text-error text-xl">*</span>
        )}
        <textarea
          data-testid="textarea"
          id={name}
          name={name}
          placeholder={placeholder ?? label}
          required={required}
          className={classNames("textarea textarea-bordered h-24 w-full", {
            validator: required,
          })}
          {...props}
        ></textarea>
      </div>
    </>
  );
}
