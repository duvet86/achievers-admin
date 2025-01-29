interface Props {
  children?: React.ReactNode;
}

export function SubTitle({ children }: Props) {
  return (
    <h3 className="border-primary my-4 border-b font-bold uppercase">
      {children}
    </h3>
  );
}
