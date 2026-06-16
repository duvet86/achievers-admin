import { WarningTriangle } from "iconoir-react";

import { StateLink } from "../state-link/StateLink";

interface Props {
  studentId: number;
}

export function EditorQuestions({ studentId }: Props) {
  return (
    <div className="hidden w-1/4 border bg-slate-100 p-2 text-pretty sm:block">
      <p className="font-semibold">You might like to reflect on…</p>
      <hr className="my-2" />
      <ul className="list-inside list-disc p-2" data-testid="questions">
        <li>What work did you cover this week?</li>
        <li>What went well?</li>
        <li>What could be improved on?</li>
        <li>Any notes for next week for your partner mentor?</li>
        <li>Any notes for your Chapter Coordinator?</li>
      </ul>

      <hr />

      <p className="text-error mt-2">
        Please do not include any sensitive or personal student information. If
        you have any concerns or questions, please use the button below:
      </p>
      <StateLink
        className="btn btn-error mt-4"
        to={`/mentor/students/${studentId}/report-to-admin`}
      >
        <WarningTriangle />
        Report to Admin
      </StateLink>
    </div>
  );
}
