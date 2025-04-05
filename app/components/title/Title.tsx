import { Link, useLocation } from "react-router";
import classnames from "classnames";
import { NavArrowLeft } from "iconoir-react";

interface Props {
  className?: string;
  children?: React.ReactNode;
}

export function Title({ className, children }: Props) {
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const history: string[] = location.state?.history ?? [];

  return (
    <div className={classnames("flex items-center gap-4", className)}>
      {history.length > 0 && (
        <Link
          to={history[history.length - 1]}
          state={{
            history: history.slice(0, -1),
          }}
          className="btn btn-square w-14"
        >
          <NavArrowLeft className="h-8 w-8" />
        </Link>
      )}

      <h1 className="text-2xl font-bold text-wrap uppercase">{children}</h1>
    </div>
  );
}
