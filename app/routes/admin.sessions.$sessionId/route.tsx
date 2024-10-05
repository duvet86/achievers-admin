import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import {
  Xmark,
  Check,
  StatsReport,
  WarningCircle,
  EditPencil,
  OnTag,
} from "iconoir-react";

import { Title, Textarea } from "~/components";

import { enableSession, getSessionByIdAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.sessionId, "sessionId not found");

  const session = await getSessionByIdAsync(Number(params.sessionId));

  return json({
    attendedOnLabel: dayjs(session.attendedOn).format("MMMM D, YYYY"),
    session,
  });
}

export async function action({ params }: ActionFunctionArgs) {
  invariant(params.sessionId, "sessionId not found");

  await enableSession(Number(params.sessionId));

  return null;
}

export default function Index() {
  const {
    attendedOnLabel,
    session: {
      id,
      chapter,
      user,
      student,
      isCancelled,
      reasonCancelled,
      hasReport,
      completedOn,
      signedOffOn,
    },
  } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [searchParams] = useSearchParams();

  const backURL = searchParams.get("back_url");

  const enableSession = () => {
    if (confirm("Are you sure you want to re-enable the session?")) {
      submit(null, { method: "post" });
    }
  };

  return (
    <>
      <div className="flex justify-between gap-4">
        <div className="flex gap-8">
          <Title
            className="shrink-0"
            to={
              backURL ? backURL : `/admin/sessions?${searchParams.toString()}`
            }
          >
            Session of &quot;
            {attendedOnLabel}&quot;
          </Title>

          {isCancelled && (
            <div role="alert" className="alert alert-error">
              <WarningCircle />
              <span>Session has been cancelled</span>
            </div>
          )}
        </div>

        {isCancelled && (
          <button
            onClick={enableSession}
            className="btn btn-secondary w-48 gap-2"
          >
            <OnTag /> Re-enable session
          </button>
        )}
      </div>

      <div className="my-8 flex flex-col gap-12">
        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Session</div>
          <div className="flex-1">{attendedOnLabel}</div>
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Chapter</div>
          <div className="flex-1">{chapter.name}</div>
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Student</div>
          <div className="flex-1">{student?.fullName}</div>
          {!completedOn && (
            <Link
              className="btn btn-primary w-44"
              to={`/admin/chapters/${chapter.id}/sessions/${id}/mentors/${user.id}/update-assignment`}
            >
              <EditPencil /> Edit student
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Mentor</div>
          <div className="flex-1">{user.fullName}</div>
          {!student && (
            <p className="bg-info">
              Mentor has marked available for the session.
            </p>
          )}
          {student && !completedOn && (
            <Link
              className="btn btn-primary w-44"
              to={`/admin/chapters/${chapter.id}/sessions/${id}/students/${student.id}/update-assignment`}
            >
              <EditPencil /> Edit mentor
            </Link>
          )}
        </div>

        {isCancelled ? (
          <div className="flex items-center gap-2 p-2">
            <div className="w-72 font-bold">Reason</div>
            <Textarea defaultValue={reasonCancelled!} disabled />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 border-b p-2">
              <div className="w-72 font-bold">Has report?</div>
              <div className="flex-1">
                {hasReport ? (
                  <Check className="h-6 w-6 text-success" />
                ) : (
                  <Xmark className="h-6 w-6 text-error" />
                )}
              </div>
              {hasReport && (
                <Link
                  to={`report?${searchParams.toString()}`}
                  className="btn btn-success gap-2"
                >
                  <StatsReport /> Go to report
                </Link>
              )}
              {!hasReport && user.id && (
                <Link
                  to={`/admin/sessions/${id}/mentors/${user.id}/write-report?back_url=/admin/sessions/${id}`}
                  className="btn btn-success gap-2"
                >
                  <EditPencil /> Write report on behalf
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2 border-b p-2">
              <div className="w-72 font-bold">Is report completed?</div>
              <div className="flex-1">
                {completedOn ? (
                  <Check className="h-6 w-6 text-success" />
                ) : (
                  <Xmark className="h-6 w-6 text-error" />
                )}
              </div>
              {completedOn && dayjs(completedOn).format("MMMM D, YYYY")}
            </div>
            <div className="flex items-center gap-2 border-b p-2">
              <div className="w-72 font-bold">Is report signed off?</div>
              <div className="flex-1">
                {signedOffOn ? (
                  <Check className="h-6 w-6 text-success" />
                ) : (
                  <Xmark className="h-6 w-6 text-error" />
                )}
              </div>
              {signedOffOn && dayjs(signedOffOn).format("MMMM D, YYYY")}
            </div>
          </>
        )}
      </div>
    </>
  );
}