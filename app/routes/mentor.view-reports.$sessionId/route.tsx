import type { Route } from "./+types/route";

import dayjs from "dayjs";
import invariant from "tiny-invariant";

import editorStylesheetUrl from "~/styles/editor.css?url";
import { Editor, SubTitle, Title } from "~/components";

import { getSessionAsync } from "./services.server";
import { redirect } from "react-router";

export const links: Route.LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStylesheetUrl }];
};

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.sessionId, "sessionId not found");

  const session = await getSessionAsync(Number(params.sessionId));

  if (session.isCancelled) {
    return redirect(`/mentor/sessions/${session.id}/student-absent`);
  }

  return {
    session,
  };
}

export default function Index({
  loaderData: { session },
}: Route.ComponentProps) {
  return (
    <>
      <Title>
        Report of &quot;
        {dayjs(session.attendedOn).format("DD/MM/YYYY")}
        &quot;
      </Title>

      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
        <h3 className="my-4 font-bold">Mentor:</h3>
        <p>{session.mentorSession.mentor.fullName}</p>

        <h3 className="my-4 font-bold">Student:</h3>
        <p>{session.studentSession.student.fullName}</p>
      </div>

      <SubTitle>Report</SubTitle>
      <Editor isReadonly initialEditorStateType={session.report} />

      <SubTitle>Feedback</SubTitle>
      <Editor isReadonly initialEditorStateType={session.reportFeedback} />
    </>
  );
}
