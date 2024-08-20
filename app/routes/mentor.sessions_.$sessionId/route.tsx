import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import type { EditorState } from "lexical";
import type { ActionType, SessionCommandRequest } from "./services.server";

import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";

import dayjs from "dayjs";
import { useRef } from "react";
import invariant from "tiny-invariant";
import { FloppyDiskArrowIn, CheckCircle, WarningTriangle } from "iconoir-react";

import editorStylesheetUrl from "~/styles/editor.css?url";
import { Editor, SubTitle, Title } from "~/components";

import { getSessionAsync, saveReportAsync } from "./services.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStylesheetUrl }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.sessionId, "sessionId not found");

  const session = await getSessionAsync(Number(params.sessionId));

  return json({
    session,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const bodyData = (await request.json()) as SessionCommandRequest;

  const type = bodyData.type;
  const sessionId = bodyData.sessionId;
  const report = bodyData.report;

  await saveReportAsync(type, sessionId, report);

  return json({
    message: "Successfully saved",
  });
}

export default function Index() {
  const {
    session: {
      id: sessionId,
      report,
      attendedOn,
      completedOn,
      signedOffOn,
      reportFeedback,
      student,
    },
  } = useLoaderData<typeof loader>();

  const editorStateRef = useRef<EditorState>();
  const { state, submit } = useFetcher();

  const isLoading = state === "loading";
  const isReadOnlyEditor = completedOn !== null || signedOffOn !== null;

  const handleSubmitForm = (type: ActionType) => () => {
    submit(
      {
        type,
        sessionId,
        report: JSON.stringify(editorStateRef.current?.toJSON()),
      },
      {
        method: "POST",
        encType: "application/json",
      },
    );
  };

  return (
    <>
      <Title to="/mentor/roster" className="mb-4">
        Report for &quot;{student.fullName}&quot; on:{" "}
        {dayjs(attendedOn).format("MMMM D, YYYY")}
      </Title>

      <div className="relative flex h-full flex-col">
        {isLoading && (
          <div className="absolute z-30 flex h-full w-full justify-center bg-slate-300 bg-opacity-50">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        <div className="flex h-full flex-col gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex h-full flex-row">
              <div className="w-3/4">
                <Editor
                  isReadonly={isReadOnlyEditor}
                  initialEditorStateType={report}
                  onChange={(editorState) =>
                    (editorStateRef.current = editorState)
                  }
                />
              </div>

              <div className="ml-4 w-1/4">
                <p className="font-semibold">
                  Have you answered these questions?
                </p>
                <hr className="my-2" />
                <ul className="list-inside list-disc">
                  <li>What work did you cover this week?</li>
                  <li>What went well?</li>
                  <li>What could be improved on?</li>
                  <li>Any notes for next week for your partner mentor?</li>
                  <li>Any notes for your Chapter Coordinator?</li>
                </ul>
              </div>
            </div>

            <div className="flex">
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

            {reportFeedback && <SubTitle>Admin Feedback</SubTitle>}
          </div>

          {reportFeedback && (
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex-1">
                <Editor
                  isReadonly
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
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
