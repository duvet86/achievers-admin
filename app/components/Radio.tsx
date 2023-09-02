interface RadioOption {
  label: string;
  value: string;
}

interface Props {
  name: string;
  options: RadioOption[];
  label?: string;
  defaultValue?: string;
  required?: boolean;
}

export function Radio({ label, name, options, defaultValue, required }: Props) {
  return (
    <div className="relative">
      <span className="label-text">{label}</span>
      {required && (
        <span
          data-testid="required"
          className="label-text-alt absolute bottom-2 right-0 text-2xl text-error"
        >
          *
        </span>
      )}
      <div className="flex gap-8">
        {options.map(({ label, value }, i) => (
          <div key={i} className="form-control">
            <label className="label cursor-pointer gap-2">
              <input
                type="radio"
                name={name}
                value={value}
                defaultChecked={defaultValue === value}
                className="radio"
                required={required}
              />
              <span className="label-text">{label}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
