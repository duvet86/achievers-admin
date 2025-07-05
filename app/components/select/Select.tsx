import classNames from "classnames";

interface SelectOption {
  label: string;
  value: string;
}

interface Props
  extends React.DetailedHTMLProps<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  > {
  label?: string;
  options: SelectOption[];
}

export function Select({ label, name, options, required, ...props }: Props) {
  return (
    <>
      <label htmlFor={name} className="fieldset-label">
        {label}
      </label>
      <div className="indicator w-full">
        {required && (
          <span className="indicator-item badge text-error text-xl">*</span>
        )}
        <select
          name={name}
          id={name}
          className={classNames("select w-full", {
            validator: required,
          })}
          required={required}
          {...props}
        >
          {options.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
