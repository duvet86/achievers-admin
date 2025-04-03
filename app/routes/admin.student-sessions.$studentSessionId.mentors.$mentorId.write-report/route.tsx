import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "react-router";
import type { EditorState } from "lexical";
import type { ActionType, SessionCommandRequest } from "./services.server";

import {
  redirect,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from "react-router";
import invariant from "tiny-invariant";

import { useRef } from "react";
import dayjs from "dayjs";
import { FloppyDiskArrowIn, DesignNib, WarningTriangle } from "iconoir-react";

import { getLoggedUserInfoAsync } from "~/services/.server/session.server";

import editorStylesheetUrl from "~/styles/editor.css?url";
import { isEditorEmpty } from "~/services";
import { Editor, EditorQuestions, SubTitle, Title } from "~/components";

import { getStudentSessionIdAsync, saveReportAsync } from "./services.server";
import { isSessionDateInTheFuture } from "./services.client";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStylesheetUrl }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.studentSessionId, "studentSessionId not found");

  const studentSession = await getStudentSessionIdAsync(
    Number(params.studentSessionId),
  );

  return {
    studentSession,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.studentSessionId, "studentSessionId not found");
  invariant(params.mentorId, "mentorId not found");

  const loggedUser = await getLoggedUserInfoAsync(request);

  const bodyData = (await request.json()) as SessionCommandRequest;

  const actionType = bodyData.actionType;
  const studentSessionId = bodyData.studentSessionId;
  const report = bodyData.report;
  const reportFeedback = bodyData.reportFeedback;

  await saveReportAsync({
    actionType,
    studentSessionId,
    report,
    reportFeedback,
    userAzureId: loggedUser.oid,
  });

  if (actionType === "signoff") {
    return redirect(
      `/admin/student-sessions/${params.studentSessionId}/report`,
    );
  }

  return null;
}

export default function Index() {
  const {
    studentSession: { id, report, reportFeedback, session },
  } = useLoaderData<typeof loader>();
  const { state, submit } = useFetcher<typeof loader>();

  const editorReportStateRef = useRef<EditorState>(null);
  const editorFeedbackStateRef = useRef<EditorState>(null);
  const [searchParams] = useSearchParams();

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

    if (isSessionDateInTheFuture(session.attendedOn)) {
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
        studentSessionId: id,
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
      <Title
        to={
          searchParams.get("back_url")
            ? searchParams.get("back_url")!
            : undefined
        }
        className="mb-4"
      >
        Report of &quot;{dayjs(session.attendedOn).format("DD/MM/YYYY")}&quot;
        on behalf of &quot;{session.mentor.fullName}&quot;
      </Title>

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
                className="btn btn-primary w-full sm:w-44"
                onClick={saveReport("draft")}
              >
                <FloppyDiskArrowIn />
                Save as draft
              </button>

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
