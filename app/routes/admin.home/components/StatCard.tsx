import { Link } from "react-router";
import { NavArrowRight } from "iconoir-react";

interface Props {
  Icon: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, "ref"> &
      React.RefAttributes<SVGSVGElement>
  >;
  label: string;
  count: number;
  subLabel: string;
  to?: string;
}

export function StatCard({ Icon, label, count, subLabel, to }: Props) {
  return (
    <div className="stat">
      <div className="stat-figure text-secondary hidden lg:block">
        <Icon className="inline-block h-8 w-8 stroke-current" />
      </div>

      <h1 className="stat-title">{label}</h1>
      <h2 className="stat-value">{count}</h2>
      <h3 className="stat-desc">{subLabel}</h3>

      <div className="stat-actions col-span-2 mt-2 h-8 w-max">
        {to && (
          <Link to={to} className="btn w-max">
            View <NavArrowRight className="h-6 w-6" />
          </Link>
        )}
      </div>
    </div>
  );
}
