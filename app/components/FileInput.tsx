interface Props {
  name: string;
  label: string;
  defaultValue?: string;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export function FileInput({ name, label, required, ...props }: Props) {
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
        type="file"
        className="file-input-bordered file-input-primary file-input w-full"
        id={name}
        name={name}
        placeholder={label}
        required={required}
        {...props}
      />
    </div>
  );
}
