import { useNavigate } from "@remix-run/react";

import { ArrowLeft } from "iconoir-react";

interface Props {
  to?: string;
}

export function BackHeader({ to }: Props) {
  const navigate = useNavigate();

  const goBack = () => (to ? navigate(to, { relative: "path" }) : navigate(-1));

  return (
    <>
      <div>
        <button onClick={goBack} className="btn btn-ghost mb-2 gap-2">
          <ArrowLeft className="w-6" />
          Back
        </button>
      </div>

      <hr className="mb-4" />
    </>
  );
}
