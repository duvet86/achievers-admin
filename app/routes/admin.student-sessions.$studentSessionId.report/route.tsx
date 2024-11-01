import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import type { EditorState } from "lexical";
import type { SessionCommandRequest } from "./services.server";

import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";

import dayjs from "dayjs";
import { useRef } from "react";
import invariant from "tiny-invariant";
import { DesignNib, Xmark } from "iconoir-react";

import { getLoggedUserInfoAsync } from "~/services/.server";
import { Editor, SubTitle, Title } from "~/components";

import { getStudentSessionByIdAsync, saveReportAsync } from "./services.server";

import editorStylesheetUrl from "~/styles/editor.css?url";

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

  return {
    message: "Successfully saved",
  };
}

export default function Index() {
  const {
    studentSession: { session, report, reportFeedback, signedOffOn, student },
  } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const editorStateRef = useRef<EditorState>();
  const { state, submit } = useFetcher();

  const isLoading = state !== "idle";

  const handleSignOff = (isSignedOff: boolean) => () => {
    if (!isSignedOff) {
      if (!confirm("are you sure you want to remove the sign off?")) {
        return;
      }
    }

    submit(
      {
        reportFeedback: JSON.stringify(editorStateRef.current?.toJSON()),
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
      <Title
        className="mb-4"
        to={`/admin/student-sessions?${searchParams.toString()}`}
      >
        Report for &quot;{student?.fullName}&quot; on:{" "}
        {dayjs(session.attendedOn).format("MMMM D, YYYY")}
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
