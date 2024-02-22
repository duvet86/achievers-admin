import { Link, useSearchParams } from "@remix-run/react";

import { ArrowLeft } from "iconoir-react";

interface Props {
  to: string;
}

export function BackHeader({ to }: Props) {
  const [searchParams] = useSearchParams();

  return (
    <>
      <div>
        <Link to={`${to}?${searchParams}`} className="btn btn-ghost mb-2 gap-2">
          <ArrowLeft className="w-6" />
          Back
        </Link>
      </div>

      <hr className="mb-4" />
    </>
  );
}
