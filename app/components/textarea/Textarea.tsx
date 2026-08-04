import classNames from "classnames";

interface Props {
  label?: string;
}

export function Textarea({
  label,
  name,
  required,
  placeholder,
  ...props
}: Props &
  React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >) {
  return (
    <>
      <label htmlFor={name} className="fieldset-label">
        {label}
      </label>
      <div className="indicator w-full">
        {required && (
          <span className="indicator-item badge text-error text-xl">*</span>
        )}
        <textarea
          data-testid="textarea"
          id={name}
          name={name}
          placeholder={placeholder ?? label}
          required={required}
          className={classNames("textarea textarea-bordered h-24 w-full", {
            validator: required,
          })}
          {...props}
        ></textarea>
      </div>
    </>
  );
}
