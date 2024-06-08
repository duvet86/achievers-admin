import { Link } from "@remix-run/react";
import classnames from "classnames";
import { NavArrowLeft } from "iconoir-react";

interface Props {
  className?: string;
  to?: string;
  children?: React.ReactNode;
}

export function Title({ className, to, children }: Props) {
  return (
    <div className={classnames("flex items-center gap-2", className)}>
      {to && (
        <Link to={to} className="btn btn-square">
          <NavArrowLeft className="h-8 w-8" />
        </Link>
      )}

      <h1 className="text-2xl font-bold uppercase">{children}</h1>
    </div>
  );
}
