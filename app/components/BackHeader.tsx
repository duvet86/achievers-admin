import { Link } from "@remix-run/react";

import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";

interface Props {
  to?: string;
}

export default function BackHeader({ to = "../" }: Props) {
  return (
    <>
      <div>
        <Link to={to} relative="path" className="btn-ghost btn mb-2 gap-2">
          <ArrowSmallLeftIcon className="w-6" />
          Back
        </Link>
      </div>

      <hr className="mb-4" />
    </>
  );
}
