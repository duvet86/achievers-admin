import type { EditorState } from "lexical";
import type { Route } from "./+types/route";
import type { ActionType, SessionCommandRequest } from "./services.server";

import { redirect, useFetcher } from "react-router";
import invariant from "tiny-invariant";

import { useRef } from "react";
import dayjs from "dayjs";
import { DesignNib, WarningTriangle } from "iconoir-react";

import { getLoggedUserInfoAsync } from "~/services/.server/session.server";

import editorStylesheetUrl from "~/styles/editor.css?url";
import { isEditorEmpty } from "~/services";
import {
  Editor,
  EditorQuestions,
  Message,
  SubTitle,
  Title,
} from "~/components";

import { getSessionIdAsync, saveReportAsync } from "./services.server";
import { isSessionDateInTheFuture } from "./services.client";

export const links: Route.LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStylesheetUrl }];
};

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.sessionId, "sessionId not found");

  const session = await getSessionIdAsync(Number(params.sessionId));
  if (session.signedOffOn) {
    return redirect(`/admin/sessions/${session.id}/report`);
  }

  return {
    session,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.sessionId, "sessionId not found");

  const loggedUser = await getLoggedUserInfoAsync(request);

  const bodyData = (await request.json()) as SessionCommandRequest;

  const actionType = bodyData.actionType;
  const sessionId = bodyData.sessionId;
  const report = bodyData.report;
  const reportFeedback = bodyData.reportFeedback;

  await saveReportAsync({
    actionType,
    sessionId,
    report,
    reportFeedback,
    userAzureId: loggedUser.oid,
  });

  return {
    successMessage: "Report saved successfully",
  };
}

export default function Index({
  loaderData: {
    session: { id, report, reportFeedback, attendedOn, mentorSession },
  },
}: Route.ComponentProps) {
  const { data, state, submit } = useFetcher<typeof action>();

  const editorReportStateRef = useRef<EditorState>(null);
  const editorFeedbackStateRef = useRef<EditorState>(null);

  const isLoading = state !== "idle";

  const saveReport = (type: ActionType) => () => {
    const reportState = editorReportStateRef.current!;

    if (isEditorEmpty(reportState)) {
      (
        document.getElementById("errorModalContent") as HTMLDivElement
      ).textContent = "Report cannot be blank.";
      (document.getElementById("errorModal") as HTMLDialogElement).showModal();
      return;
    }

    if (isSessionDateInTheFuture(attendedOn)) {
      (
        document.getElementById("errorModalContent") as HTMLDivElement
      ).textContent = "Session date is in the future.";
      (document.getElementById("errorModal") as HTMLDialogElement).showModal();
      return;
    }

    const reportFeedbackState = editorFeedbackStateRef.current!;

    if (type === "signoff") {
      if (isEditorEmpty(reportFeedbackState)) {
        (
          document.getElementById("errorModalContent") as HTMLDivElement
        ).textContent = "Report Feedback cannot be blank.";
        (
          document.getElementById("errorModal") as HTMLDialogElement
        ).showModal();
        return;
      }
    }

    void submit(
      {
        actionType: type,
        sessionId: id,
        report: JSON.stringify(reportState.toJSON()),
        reportFeedback: isEditorEmpty(reportFeedbackState)
          ? null
          : JSON.stringify(reportFeedbackState.toJSON()),
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
          Report of &quot;{dayjs(attendedOn).format("DD/MM/YYYY")}&quot; on
          behalf of &quot;{mentorSession.mentor.fullName}&quot;
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
            <div className="flex h-full flex-row">
              <div className="w-full">
                <Editor
                  initialEditorStateType={report}
                  onChange={(editorState) =>
                    (editorReportStateRef.current = editorState)
                  }
                />
              </div>

              <EditorQuestions />
            </div>

            <SubTitle>Admin Feedback</SubTitle>
          </div>

          <div className="flex flex-1 flex-col gap-4 pb-2">
            <div className="flex-1">
              <Editor
                initialEditorStateType={reportFeedback}
                onChange={(editorState) =>
                  (editorFeedbackStateRef.current = editorState)
                }
              />
            </div>

            <div className="flex flex-wrap justify-end gap-4 sm:gap-8">
              <button
                className="btn btn-success w-full sm:w-44"
                onClick={saveReport("signoff")}
              >
                <DesignNib /> Sign off
              </button>
            </div>
          </div>
        </div>
      </div>
      <dialog id="errorModal" className="modal">
        <div className="modal-box">
          <h3 className="flex gap-2 text-lg font-bold">
            <WarningTriangle className="text-error" />
            Error
          </h3>
          <p className="py-4" id="errorModalContent"></p>
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
