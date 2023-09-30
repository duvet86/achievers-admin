interface Props {
  name: string;
  label: string;
  defaultValue?: string;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  accept?: string;
}

export function FileInput({ name, label, required, ...props }: Props) {
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
        data-testid="fileinput"
        type="file"
        className="file-input file-input-bordered file-input-primary w-full"
        id={name}
        name={name}
        placeholder={label}
        required={required}
        {...props}
      />
    </div>
  );
}
