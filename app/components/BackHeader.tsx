import { useNavigate } from "@remix-run/react";

import { ArrowLeft } from "iconoir-react";

export function BackHeader() {
  const navigate = useNavigate();

  const goBack = () => navigate(-1);

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
