interface Props {
  children?: React.ReactNode;
}

export function SubTitle({ children }: Props) {
  return (
    <h3 className="my-4 border-b border-primary font-bold uppercase">
      {children}
    </h3>
  );
}
