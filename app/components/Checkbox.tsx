export interface Props {
  label?: string;
  name: string;
  defaultChecked: boolean;
}

export default function Checkbox({ label, name, defaultChecked }: Props) {
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
          defaultChecked={defaultChecked}
        />
      </label>
    </div>
  );
}
