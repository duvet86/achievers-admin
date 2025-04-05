import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "react-router";
import type { EditorState } from "lexical";
import type { SessionCommandRequest } from "./services.server";

import { redirect, useFetcher, useLoaderData } from "react-router";

import dayjs from "dayjs";
import { useRef } from "react";
import invariant from "tiny-invariant";
import { DesignNib, WarningTriangle, Xmark } from "iconoir-react";

import editorStylesheetUrl from "~/styles/editor.css?url";
import { getLoggedUserInfoAsync } from "~/services/.server";
import { isEditorEmpty } from "~/services";
import { Editor, SubTitle, Title } from "~/components";

import { getStudentSessionByIdAsync, saveReportAsync } from "./services.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStylesheetUrl }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.studentSessionId, "studentSessionId not found");

  const studentSession = await getStudentSessionByIdAsync(
    Number(params.studentSessionId),
  );

  return {
    studentSession,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.studentSessionId, "studentSessionId not found");

  const loggedUser = await getLoggedUserInfoAsync(request);

  const bodyData = (await request.json()) as SessionCommandRequest;

  const reportFeedback = bodyData.reportFeedback;
  const isSignedOff = bodyData.isSignedOff;

  await saveReportAsync(
    Number(params.studentSessionId),
    reportFeedback,
    isSignedOff,
    loggedUser.oid,
  );

  const url = new URL(request.url);

  return redirect(`/admin/student-sessions?${url.searchParams}`);
}

export default function Index() {
  const {
    studentSession: { session, report, reportFeedback, signedOffOn, student },
  } = useLoaderData<typeof loader>();

  const editorStateRef = useRef<EditorState>(null);
  const { state, submit } = useFetcher();

  const isLoading = state !== "idle";

  const handleSignOff = (isSignedOff: boolean) => () => {
    if (!isSignedOff) {
      if (!confirm("are you sure you want to remove the sign off?")) {
        return;
      }
    }

    const resportState = editorStateRef.current!;

    if (isEditorEmpty(resportState)) {
      (document.getElementById("errorModal") as HTMLDialogElement).showModal();
      return;
    }

    void submit(
      {
        reportFeedback: JSON.stringify(resportState.toJSON()),
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
      <Title className="mb-4">
        {dayjs(session.attendedOn).format("MMMM D, YYYY")} - mentor: &quot;
        {session.mentor.fullName}&quot; student: &quot;
        {student.fullName}&quot;
      </Title>

      <div className="relative flex h-full flex-col">
        {isLoading && (
          <div className="bg-opacity-50 absolute z-30 flex h-full w-full justify-center bg-slate-300">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        <div className="flex h-full flex-col gap-4">
          <div className="flex flex-1 flex-col gap-4">
            <Editor isReadonly initialEditorStateType={report} />

            <SubTitle>Admin Feedback</SubTitle>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div className="min-h-56 flex-1">
              <Editor
                isReadonly={signedOffOn !== null}
                initialEditorStateType={reportFeedback}
                onChange={(editorState) =>
                  (editorStateRef.current = editorState)
                }
              />
            </div>

            <div className="flex items-center gap-4">
              <p className="text-info flex-1">
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
      <dialog id="errorModal" className="modal">
        <div className="modal-box">
          <h3 className="flex gap-2 text-lg font-bold">
            <WarningTriangle className="text-error" />
            Please write a feedback
          </h3>
          <p className="py-4">Admin Feedback cannot be blank.</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
