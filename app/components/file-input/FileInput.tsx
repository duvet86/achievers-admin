interface Props {
  name: string;
  label: string;
  defaultValue?: string;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  accept?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export function FileInput({
  name,
  label,
  required,
  onChange,
  ...props
}: Props) {
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
          data-testid="fileinput"
          type="file"
          className="file-input file-input-bordered file-input-primary w-full"
          id={name}
          name={name}
          placeholder={label}
          required={required}
          onChange={onChange}
          {...props}
        />
      </div>
    </>
  );
}
