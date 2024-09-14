import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import type { EditorState } from "lexical";
import type { ActionType, SessionCommandRequest } from "./services.server";

import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import invariant from "tiny-invariant";

import { useRef } from "react";
import dayjs from "dayjs";
import { FloppyDiskArrowIn, DesignNib } from "iconoir-react";

import editorStylesheetUrl from "~/styles/editor.css?url";
import { Editor, SubTitle, Title } from "~/components";

import { getLoggedUserInfoAsync } from "~/services/.server/session.server";
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

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.sessionId, "sessionId not found");
  invariant(params.mentorId, "mentorId not found");

  const loggedUser = await getLoggedUserInfoAsync(request);

  const bodyData = (await request.json()) as SessionCommandRequest;

  const type = bodyData.type;
  const sessionId = bodyData.sessionId;
  const report = bodyData.report;
  const reportFeedback = bodyData.reportFeedback;

  await saveReportAsync(
    type,
    sessionId,
    report,
    reportFeedback,
    loggedUser.oid,
  );

  return redirect(`/admin/sessions/${params.sessionId}`);
}

export default function Index() {
  const { session } = useLoaderData<typeof loader>();
  const { state, submit } = useFetcher<typeof loader>();

  const editorReportStateRef = useRef<EditorState>();
  const editorFeedbackStateRef = useRef<EditorState>();
  const [searchParams] = useSearchParams();

  const isLoading = state === "loading";

  const saveReport = (type: ActionType) => () => {
    submit(
      {
        type,
        sessionId: session.id,
        report: JSON.stringify(editorReportStateRef.current?.toJSON()),
        reportFeedback: JSON.stringify(
          editorFeedbackStateRef.current?.toJSON(),
        ),
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
        Report of "{dayjs(session.attendedOn).format("DD/MM/YYYY")}" on behalf
        of "{session.user.fullName}"
      </Title>

      <div className="relative flex h-full flex-col">
        {isLoading && (
          <div className="absolute z-30 flex h-full w-full justify-center bg-slate-300 bg-opacity-50">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        <div className="flex h-full flex-col gap-4">
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex h-full flex-row">
              <div className="w-full">
                <Editor
                  initialEditorStateType={session.report}
                  onChange={(editorState) =>
                    (editorReportStateRef.current = editorState)
                  }
                />
              </div>

              <div className="w-1/4 border-b pb-2 pl-2">
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

            <SubTitle>Admin Feedback</SubTitle>
          </div>

          <div className="flex flex-1 flex-col gap-4 pb-2">
            <div className="flex-1">
              <Editor
                initialEditorStateType={session.reportFeedback}
                onChange={(editorState) =>
                  (editorFeedbackStateRef.current = editorState)
                }
              />
            </div>

            <div className="flex justify-end gap-8">
              <button
                className="btn btn-primary w-44"
                onClick={saveReport("draft")}
              >
                <FloppyDiskArrowIn className="h-6 w-6" />
                Save as draft
              </button>

              <button
                className="btn btn-success w-44"
                onClick={saveReport("signoff")}
              >
                <DesignNib className="h-6 w-6" /> Sign off
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
