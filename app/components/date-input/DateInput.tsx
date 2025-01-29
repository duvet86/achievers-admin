import dayjs from "dayjs";

interface Props {
  name: string;
  label: string;
  defaultValue?: Date | string;
  readOnly?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
}

export function DateInput({
  label,
  name,
  defaultValue,
  required,
  ...props
}: Props) {
  const value =
    defaultValue !== undefined &&
    (defaultValue instanceof Date || defaultValue.trim() !== "")
      ? dayjs(defaultValue).format("YYYY-MM-DD")
      : defaultValue;

  return (
    <>
      <label className="fieldset-label">{label}</label>
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
          className="input input-bordered w-full"
          defaultValue={value}
          required={required}
          {...props}
        />
      </div>
    </>
  );
}
