import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import type { EditorState } from "lexical";
import type { ActionType } from "./services.server";

import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";

import dayjs from "dayjs";
import { useRef } from "react";
import invariant from "tiny-invariant";
import { FloppyDiskArrowIn, CheckCircle, WarningTriangle } from "iconoir-react";

import {
  getCurrentUserADIdAsync,
  getUserByAzureADIdAsync,
} from "~/services/.server";
import { Editor, Title } from "~/components";

import {
  getSessionReportForStudentAsync,
  saveReportAsync,
} from "./services.server";

import editorStylesheetUrl from "~/styles/editor.css?url";

interface SessionCommandRequest {
  type: ActionType;
  report: string;
  attendedOn: string;
  chapterId: number;
  studentId: number;
  userId: number;
}

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStylesheetUrl }];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.studentId, "studentId not found");
  invariant(params.attendedOn, "attendedOn not found");

  const azureUserId = await getCurrentUserADIdAsync(request);
  const user = await getUserByAzureADIdAsync(azureUserId);

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
  const bodyData: SessionCommandRequest = await request.json();

  const type = bodyData.type as ActionType;
  const attendedOn = bodyData.attendedOn;
  const chapterId = bodyData.chapterId;
  const studentId = bodyData.studentId;
  const userId = bodyData.userId;
  const report = bodyData.report;

  await saveReportAsync(
    type,
    {
      attendedOn,
      chapterId,
      studentId,
      userId,
    },
    report,
  );

  return json({
    message: "Successfully saved",
  });
}

export default function Index() {
  const {
    chapterId,
    userId,
    studentReport: { report, attendedOn, completedOn, signedOffOn, student },
  } = useLoaderData<typeof loader>();

  const editorStateRef = useRef<EditorState>();
  const { state, submit } = useFetcher();

  const isLoading = state === "loading";

  const message = signedOffOn !== null ? "Report has been signed off" : "";
  const isReadOnlyEditor = completedOn !== null || signedOffOn !== null;

  const handleSubmitForm = (type: ActionType) => () => {
    submit(
      {
        type,
        report: JSON.stringify(editorStateRef.current?.toJSON()),
        attendedOn,
        chapterId,
        studentId: student.id,
        userId,
      },
      {
        method: "POST",
        encType: "application/json",
      },
    );
  };

  return (
    <>
      <Title>
        Report for &quot;{student.firstName} {student.lastName}&quot; on:{" "}
        {dayjs(attendedOn).format("MMMM D, YYYY")}
      </Title>

      <div className="relative">
        {isLoading && (
          <div className="absolute z-30 flex h-full w-full justify-center bg-slate-300 bg-opacity-50">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        <div className="h-56">
          <Editor
            isReadonly={isReadOnlyEditor}
            initialEditorStateType={report}
            onChange={(editorState) => (editorStateRef.current = editorState)}
          />
        </div>

        <div className="flex">
          <p className="flex-1 italic text-info">{message}</p>

          <div className="flex gap-8">
            {completedOn === null && (
              <button
                className="btn btn-success w-48"
                onClick={handleSubmitForm("completed")}
              >
                <CheckCircle className="h-6 w-6" />
                Mark as completed
              </button>
            )}

            {completedOn !== null && signedOffOn === null && (
              <button
                className="btn btn-error w-48"
                onClick={handleSubmitForm("remove-complete")}
              >
                <WarningTriangle className="h-6 w-6" />
                Unmark completed
              </button>
            )}

            {completedOn === null && (
              <button
                className="btn btn-primary w-44"
                onClick={handleSubmitForm("draft")}
              >
                <FloppyDiskArrowIn className="h-6 w-6" />
                Save as draft
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
