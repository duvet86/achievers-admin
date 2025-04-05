import type { LinksFunction, LoaderFunctionArgs } from "react-router";

import { useLoaderData } from "react-router";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import classNames from "classnames";
import { InfoCircle } from "iconoir-react";

import editorStylesheetUrl from "~/styles/editor.css?url";
import { Editor, SubTitle, Title } from "~/components";

import { getStudentSessionAsync } from "./services.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStylesheetUrl }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.studentSessionId, "studentSessionId not found");

  const studentSession = await getStudentSessionAsync(
    Number(params.studentSessionId),
  );

  return {
    studentSession,
  };
}

export default function Index() {
  const { studentSession } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex w-full items-center gap-8">
        <Title
          className={classNames({
            "text-error": studentSession.isCancelled,
          })}
        >
          Report of &quot;
          {dayjs(studentSession.session.attendedOn).format("DD/MM/YYYY")}
          &quot;
        </Title>

        {studentSession.isCancelled && (
          <p className="text-error flex gap-4 font-medium">
            <InfoCircle />
            Session has been cancelled
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
        <h3 className="my-4 font-bold">Mentor:</h3>
        <p>{studentSession.session.mentor.fullName}</p>

        <h3 className="my-4 font-bold">Student:</h3>
        <p>{studentSession.student.fullName}</p>
      </div>

      <SubTitle>Report</SubTitle>
      <Editor isReadonly initialEditorStateType={studentSession.report} />

      <SubTitle>Feedback</SubTitle>
      <Editor
        isReadonly
        initialEditorStateType={studentSession.reportFeedback}
      />
    </>
  );
}
