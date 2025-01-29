import { Link } from "react-router";
import classnames from "classnames";
import { NavArrowLeft } from "iconoir-react";

interface Props {
  className?: string;
  to?: string;
  children?: React.ReactNode;
}

export function Title({ className, to, children }: Props) {
  return (
    <div className={classnames("flex items-center gap-4", className)}>
      {to && (
        <Link to={to} className="btn btn-square w-14">
          <NavArrowLeft className="h-8 w-8" />
        </Link>
      )}

      <h1 className="text-2xl font-bold text-wrap uppercase">{children}</h1>
    </div>
  );
}
