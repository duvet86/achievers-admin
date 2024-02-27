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

import { getCurrentUserADIdAsync } from "~/services/.server";
import { Editor, Title } from "~/components";

import {
  getSessionReportForStudentAsync,
  getUserAsync,
  saveReportAsync,
} from "./services.server";

import editorStylesheetUrl from "~/styles/editor.css?url";

interface SessionCommandRequest {
  report: string;
  attendedOn: string;
  chapterId: number;
  studentId: number;
  userId: number;
  isSignedOff: "on" | "off" | null;
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
  const report = bodyData.report;
  const isSignedOff = bodyData.isSignedOff;

  await saveReportAsync(
    {
      attendedOn,
      chapterId,
      studentId,
      userId,
    },
    report,
    isSignedOff === "on",
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
    studentReport: { report, attendedOn, student, signedOffOn },
  } = useLoaderData<typeof loader>();

  const editorStateRef = useRef<EditorState>();
  const { Form, state, submit } = useFetcher();

  const isLoading = state === "loading";

  function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const isSignedOff = data.get("isSignedOff")?.toString();

    submit(
      {
        report: JSON.stringify(editorStateRef.current?.toJSON()),
        attendedOn,
        chapterId,
        studentId: student.id,
        userId,
        isSignedOff: isSignedOff ?? null,
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

        <div className="h-56">
          <Editor
            initialEditorStateType={report}
            onChange={(editorState) => (editorStateRef.current = editorState)}
          />
        </div>

        <Form
          className="flex items-center justify-end gap-4"
          onSubmit={submitForm}
        >
          <div className="form-control">
            <label className="label cursor-pointer">
              <input
                type="checkbox"
                className="checkbox mr-4"
                name="isSignedOff"
                defaultChecked={signedOffOn !== null}
              />
              <span className="label-text">Signed off</span>
            </label>
          </div>

          <button className="btn btn-success w-44" type="submit">
            <FloppyDiskArrowIn className="h-6 w-6" /> Save
          </button>
        </Form>
      </div>
    </>
  );
}
