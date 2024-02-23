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
import { FloppyDiskArrowIn } from "iconoir-react";

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

  const attendedOn = bodyData.attendedOn;
  const chapterId = bodyData.chapterId;
  const studentId = bodyData.studentId;
  const userId = bodyData.userId;
  const report = bodyData.report;

  await saveReportAsync(
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
    studentReport: { report, attendedOn, student },
  } = useLoaderData<typeof loader>();

  const editorStateRef = useRef<EditorState>();
  const { state, submit } = useFetcher();

  const isLoading = state === "loading";

  function submitForm() {
    submit(
      {
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
  }

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

        <div className="mb-4">
          <Editor
            initialEditorStateType={report}
            onChange={(editorState) => (editorStateRef.current = editorState)}
          />
        </div>

        <button className="btn btn-success float-end w-44" onClick={submitForm}>
          <FloppyDiskArrowIn className="h-6 w-6" /> Save
        </button>
      </div>
    </>
  );
}
