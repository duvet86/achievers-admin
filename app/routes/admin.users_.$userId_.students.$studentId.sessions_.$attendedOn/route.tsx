import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import type { EditorState } from "lexical";

import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";

import dayjs from "dayjs";
import { useRef } from "react";
import invariant from "tiny-invariant";
import { DesignNib, Xmark } from "iconoir-react";

import { getCurrentUserADIdAsync } from "~/services/.server";
import { Editor, SubTitle, Title } from "~/components";

import {
  getSessionReportForStudentAsync,
  getUserAsync,
  saveReportAsync,
} from "./services.server";

import editorStylesheetUrl from "~/styles/editor.css?url";

interface SessionCommandRequest {
  reportFeedback: string;
  attendedOn: string;
  chapterId: number;
  studentId: number;
  userId: number;
  isSignedOff: boolean;
}

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStylesheetUrl }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.studentId, "studentId not found");
  invariant(params.attendedOn, "attendedOn not found");

  const user = await getUserAsync(Number(params.userId));

  const studentReport = await getSessionReportForStudentAsync({
    attendedOn: params.attendedOn,
    chapterId: user.chapterId,
    studentId: Number(params.studentId),
    userId: user.id,
  });

  return json({
    studentReport,
    chapterId: user.chapterId,
    userId: user.id,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const userAzureId = await getCurrentUserADIdAsync(request);

  const bodyData: SessionCommandRequest = await request.json();

  const attendedOn = bodyData.attendedOn;
  const chapterId = bodyData.chapterId;
  const studentId = bodyData.studentId;
  const userId = bodyData.userId;
  const reportFeedback = bodyData.reportFeedback;
  const isSignedOff = bodyData.isSignedOff;

  await saveReportAsync(
    {
      attendedOn,
      chapterId,
      studentId,
      userId,
    },
    reportFeedback,
    isSignedOff,
    userAzureId,
  );

  return json({
    message: "Successfully saved",
  });
}

export default function Index() {
  const {
    chapterId,
    userId,
    studentReport: { report, reportFeedback, attendedOn, student, signedOffOn },
  } = useLoaderData<typeof loader>();

  const editorStateRef = useRef<EditorState>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { state, submit } = (useFetcher as any)();

  const isLoading = state === "loading";

  const handleSignOff = (isSignedOff: boolean) => () => {
    if (!isSignedOff) {
      if (!confirm("are you sure you want to remove the sign off?")) {
        return;
      }
    }

    submit(
      {
        reportFeedback: JSON.stringify(editorStateRef.current?.toJSON()),
        attendedOn,
        chapterId,
        studentId: student.id,
        userId,
        isSignedOff,
      },
      {
        method: "POST",
        encType: "application/json",
      },
    );
  };

  return (
    <>
      <Title classNames="mb-4" to={`/admin/chapters/${chapterId}/sessions`}>
        Report for &quot;{student.firstName} {student.lastName}&quot; on:{" "}
        {dayjs(attendedOn).format("MMMM D, YYYY")}
      </Title>

      <div className="relative flex h-full flex-col">
        {isLoading && (
          <div className="absolute z-30 flex h-full w-full justify-center bg-slate-300 bg-opacity-50">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        <div className="flex h-full flex-col gap-4">
          <div className="flex flex-1 flex-col gap-4">
            <Editor isReadonly initialEditorStateType={report} />

            <SubTitle>Admin Feedback</SubTitle>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div className="flex-1">
              <Editor
                isReadonly={signedOffOn !== null}
                initialEditorStateType={reportFeedback}
                onChange={(editorState) =>
                  (editorStateRef.current = editorState)
                }
              />
            </div>

            <div className="flex items-center gap-4">
              <p className="flex-1 text-info">
                {signedOffOn
                  ? `Report has been signed off on ${dayjs(signedOffOn).format("MMMM D, YYYY")}`
                  : ""}
              </p>

              {signedOffOn ? (
                <button
                  className="btn btn-error w-44"
                  onClick={handleSignOff(false)}
                >
                  <Xmark className="h-6 w-6" /> Remove sign off
                </button>
              ) : (
                <button
                  className="btn btn-primary w-44"
                  onClick={handleSignOff(true)}
                >
                  <DesignNib className="h-6 w-6" /> Sign off
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
