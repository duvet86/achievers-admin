interface RadioOption {
  label: string;
  value: string;
}

interface Props
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  name: string;
  options: RadioOption[];
  label?: string;
  defaultValue?: string;
  required?: boolean;
}

export function Radio({ label, name, options, defaultValue, required }: Props) {
  return (
    <>
      <label className="fieldset-label">{label}</label>
      <div data-testid={name} className="flex gap-8">
        {options.map(({ label, value }) => (
          <label key={value} className="flex cursor-pointer gap-2">
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
        ))}
      </div>
    </>
  );
}
