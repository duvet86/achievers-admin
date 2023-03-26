interface Props {
  label?: string;
  name: string;
  defaultChecked?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

export function Checkbox({ label, name, required, ...props }: Props) {
  return (
    <div className="form-control relative">
      <label
        htmlFor={name}
        className="label cursor-pointer flex-col items-start"
      >
        <span className="label-text mb-1">{label}</span>
        {required && (
          <span className="label-text-alt absolute top-6 left-8 text-2xl text-error">
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
