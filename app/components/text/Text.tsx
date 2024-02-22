interface Props {
  label: string;
  text: string;
}

export function Text({ label, text }: Props) {
  return (
    <section className="mb-4 w-full border-b border-l border-base-300 p-1">
      <h6 className="label">
        <span className="label-text font-semibold">{label}</span>
      </h6>
      <p className="w-full p-1">{text}</p>
    </section>
  );
}
