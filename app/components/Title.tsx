interface Props {
  children?: React.ReactNode;
}

export function Title({ children }: Props) {
  return <h3 className="mb-4 text-2xl font-bold uppercase">{children}</h3>;
}
