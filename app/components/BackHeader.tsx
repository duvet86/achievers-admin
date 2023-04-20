import { Link } from "@remix-run/react";

import { ArrowLeft } from "iconoir-react";

interface Props {
  to?: string;
}

export function BackHeader({ to = "../" }: Props) {
  return (
    <>
      <div>
        <Link to={to} relative="path" className="btn-ghost btn mb-2 gap-2">
          <ArrowLeft className="w-6" />
          Back
        </Link>
      </div>

      <hr className="mb-4" />
    </>
  );
}
