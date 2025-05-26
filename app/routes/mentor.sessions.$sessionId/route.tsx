import type { Route } from "./+types/route";

import dayjs from "dayjs";
import invariant from "tiny-invariant";
import classNames from "classnames";
import { InfoCircle } from "iconoir-react";

import editorStylesheetUrl from "~/styles/editor.css?url";
import { Editor, SubTitle, Title } from "~/components";

import { getSessionAsync } from "./services.server";

export const links: Route.LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStylesheetUrl }];
};

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.sessionId, "sessionId not found");

  const session = await getSessionAsync(Number(params.sessionId));

  return {
    session,
  };
}

export default function Index({
  loaderData: { session },
}: Route.ComponentProps) {
  return (
    <>
      <div className="flex w-full items-center gap-8">
        <Title
          className={classNames({
            "text-error": session.isCancelled,
          })}
        >
          Report of &quot;
          {dayjs(session.attendedOn).format("DD/MM/YYYY")}
          &quot;
        </Title>

        {session.isCancelled && (
          <p className="text-error flex gap-4 font-medium">
            <InfoCircle />
            Session has been cancelled
          </p>
        )}
      </div>

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
