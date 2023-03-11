interface Props {
  label?: string;
  name: string;
  defaultChecked?: boolean;
  required?: boolean;
}

export default function Checkbox({ label, name, ...props }: Props) {
  return (
    <div className="form-control">
      <label
        htmlFor={name}
        className="label cursor-pointer flex-col items-start"
      >
        <span className="label-text mb-1">{label}</span>
        <input
          type="checkbox"
          className="checkbox"
          id={name}
          name={name}
          {...props}
        />
      </label>
    </div>
  );
}
