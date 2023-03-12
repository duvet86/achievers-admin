import dayjs from "dayjs";

interface Props {
  name: string;
  label: string;
  defaultValue: Date | string;
  readOnly?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
}

export default function DateInput({
  label,
  name,
  defaultValue,
  required,
  ...props
}: Props) {
  const value =
    defaultValue instanceof Date
      ? dayjs(defaultValue).format("YYYY-MM-DD")
      : defaultValue;

  return (
    <div className="form-control relative w-full">
      <label htmlFor={name} className="label">
        <span className="label-text">{label}</span>
        {required && (
          <span className="label-text-alt absolute top-9 right-1 text-2xl text-error">
            *
          </span>
        )}
      </label>
      <input
        type="date"
        id={name}
        name={name}
        placeholder={label}
        className="input-bordered input w-full"
        defaultValue={value}
        required={required}
        {...props}
      />
    </div>
  );
}
