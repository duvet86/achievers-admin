interface Props {
  children?: React.ReactNode;
}

export function Title({ children }: Props) {
  return (
    <h3 data-testid="title" className="mb-4 text-2xl font-bold uppercase">
      {children}
    </h3>
  );
}
