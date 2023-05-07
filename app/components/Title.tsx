interface Props {
  children?: React.ReactNode;
}

export function Title({ children }: Props) {
  return (
    <h1 className="mb-4 text-2xl font-bold uppercase">
      {children}
    </h1>
  );
}
