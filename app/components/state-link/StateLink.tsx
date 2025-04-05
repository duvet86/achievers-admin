import type { LinkProps } from "react-router";

import { Link, useLocation } from "react-router";

export function StateLink({
  children,
  ...props
}: LinkProps & React.RefAttributes<HTMLAnchorElement>) {
  const location = useLocation();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const history: string[] = location.state?.history ?? [];

  return (
    <Link
      state={{
        history: [...history, location.pathname + location.search],
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
