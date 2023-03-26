interface Props {
  label: string;
  text: string;
}

export function Text({ label, text }: Props) {
  return (
    <div className="mb-4 w-full border-b border-l border-base-300 p-1">
      <div className="label">
        <span className="label-text font-semibold">{label}</span>
      </div>
      <p className="w-full p-1">{text}</p>
    </div>
  );
}
