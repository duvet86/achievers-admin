import classNames from "classnames";
import dayjs from "dayjs";

interface Props {
  name: string;
  label: string;
  defaultValue?: Date | string;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
}

export function DateInput({
  label,
  name,
  defaultValue,
  required,
  disabled,
  ...props
}: Props) {
  const value =
    defaultValue !== undefined &&
    (defaultValue instanceof Date || defaultValue.trim() !== "")
      ? dayjs(defaultValue).format("YYYY-MM-DD")
      : defaultValue;

  return (
    <>
      <label htmlFor={name} className="fieldset-label">
        {label}
      </label>
      <div className="indicator w-full">
        {required && (
          <span className="indicator-item badge text-error text-xl">*</span>
        )}
        <input
          data-testid="dateinput"
          type="date"
          id={name}
          name={name}
          placeholder={label}
          className={classNames("input input-bordered w-full", {
            validator: required,
          })}
          defaultValue={value}
          required={required}
          disabled={disabled}
          {...props}
        />
      </div>
    </>
  );
}
