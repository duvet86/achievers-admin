import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";

import { useLoaderData, useSearchParams } from "@remix-run/react";
import dayjs from "dayjs";
import invariant from "tiny-invariant";

import editorStylesheetUrl from "~/styles/editor.css?url";
import { Editor, SubTitle, Title } from "~/components";

import { getSessionAsync } from "./services.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStylesheetUrl }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.sessionId, "chapterId not found");

  const session = await getSessionAsync(Number(params.sessionId));

  return {
    session,
  };
}

export default function Index() {
  const { session } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <>
      <Title to={`/mentor/sessions?${searchParams.toString()}`}>
        Report of &quot;
        {dayjs(session.attendedOn).format("DD/MM/YYYY")}
        &quot;
      </Title>

      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
        <h3 className="my-4 font-bold">Mentor:</h3>
        <p>{session.user.fullName}</p>

        <h3 className="my-4 font-bold">Student:</h3>
        <p>{session.student?.fullName}</p>
      </div>

      <SubTitle>Report</SubTitle>
      <Editor isReadonly initialEditorStateType={session.report} />

      <SubTitle>Feedback</SubTitle>
      <Editor isReadonly initialEditorStateType={session.reportFeedback} />
    </>
  );
}
