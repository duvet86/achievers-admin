import type { EditorState } from "lexical";
import type { Route } from "./+types/route";
import type { SessionCommandRequest } from "./services.server";

import { Link, useFetcher, useSearchParams } from "react-router";
import dayjs from "dayjs";
import { useRef } from "react";
import invariant from "tiny-invariant";
import { DesignNib, NavArrowLeft, WarningTriangle, Xmark } from "iconoir-react";

import editorStylesheetUrl from "~/styles/editor.css?url";
import { getLoggedUserInfoAsync } from "~/services/.server";
import { isEditorEmpty } from "~/services";
import { Editor, Message, SubTitle, Title } from "~/components";

import { getSessionByIdAsync, saveReportAsync } from "./services.server";

export const links: Route.LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStylesheetUrl }];
};

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.sessionId, "sessionId not found");

  const session = await getSessionByIdAsync(Number(params.sessionId));

  return {
    session,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.sessionId, "sessionId not found");

  const loggedUser = await getLoggedUserInfoAsync(request);

  const bodyData = (await request.json()) as SessionCommandRequest;

  const reportFeedback = bodyData.reportFeedback;
  const isSignedOff = bodyData.isSignedOff;

  await saveReportAsync(
    Number(params.sessionId),
    reportFeedback,
    isSignedOff,
    loggedUser.oid,
  );

  return {
    successMessage: "Report saved successfully",
  };
}

export default function Index({
  loaderData: {
    session: {
      attendedOn,
      report,
      reportFeedback,
      signedOffOn,
      mentorSession,
      studentSession,
    },
  },
}: Route.ComponentProps) {
  const editorStateRef = useRef<EditorState>(null);
  const { state, submit, data } = useFetcher<typeof action>();
  const [searchParams] = useSearchParams();

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
      <div className="mb-4 flex flex-col gap-6 sm:flex-row">
        <Title>
          {dayjs(attendedOn).format("MMMM D, YYYY")} - mentor: &quot;
          {mentorSession.mentor.fullName}&quot; student: &quot;
          {studentSession.student.fullName}&quot;
        </Title>

        <Message key={Date.now()} successMessage={data?.successMessage} />
      </div>

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

              <Link
                to={`/admin/sessions?${searchParams.toString()}`}
                className="btn w-44"
              >
                <NavArrowLeft /> Back
              </Link>

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
