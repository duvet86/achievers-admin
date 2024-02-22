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
    <div className="form-control relative w-full">
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
  );
}
