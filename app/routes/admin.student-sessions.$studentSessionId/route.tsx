import type { LoaderFunctionArgs } from "react-router";

import { Link, useLoaderData, useSearchParams } from "react-router";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import {
  Xmark,
  Check,
  StatsReport,
  EditPencil,
  InfoCircle,
} from "iconoir-react";
import classNames from "classnames";

import { Title } from "~/components";

import { getStudentSessionByIdAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.studentSessionId, "studentSessionId not found");

  const studentSession = await getStudentSessionByIdAsync(
    Number(params.studentSessionId),
  );

  return {
    attendedOnLabel: dayjs(studentSession.session.attendedOn).format(
      "MMMM D, YYYY",
    ),
    studentSession,
  };
}

export default function Index() {
  const {
    attendedOnLabel,
    studentSession: {
      id,
      student,
      session,
      completedOn,
      signedOffOn,
      hasReport,
      isCancelled,
    },
  } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const backURL = searchParams.get("back_url");

  return (
    <>
      <div className="flex w-full items-center gap-8">
        <Title
          to={
            backURL
              ? backURL
              : `/admin/student-sessions?${searchParams.toString()}`
          }
          className={classNames({
            "text-error": isCancelled,
          })}
        >
          Session of &quot;
          {attendedOnLabel}&quot;
        </Title>

        {isCancelled && (
          <p className="flex gap-4 font-medium text-error">
            <InfoCircle />
            Session has been cancelled
          </p>
        )}
      </div>

      <div className="my-8 flex flex-col gap-12">
        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Session</div>
          <div className="flex-1">{attendedOnLabel}</div>
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Chapter</div>
          <div className="flex-1">{session.chapter.name}</div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b p-2">
          <div className="font-bold sm:w-72">Student</div>
          <div className="sm:flex-1">{student.fullName}</div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b p-2">
          <div className="font-bold sm:w-72">Mentor</div>
          <div className="sm:flex-1">{session.mentor.fullName}</div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b p-2">
          <div className="font-bold sm:w-72">Has report?</div>
          <div>
            {hasReport ? (
              <Check className="text-success" />
            ) : (
              <Xmark className="text-error" />
            )}
          </div>
          {hasReport && (
            <Link
              to={`report?${searchParams.toString()}`}
              className="btn btn-success w-full sm:w-48"
            >
              <StatsReport /> Go to report
            </Link>
          )}
          {!hasReport && session.mentor.id && (
            <Link
              to={`/admin/student-sessions/${id}/mentors/${session.mentor.id}/write-report?back_url=/admin/student-sessions/${id}`}
              className="btn btn-success w-full sm:w-48"
            >
              <EditPencil /> Report on behalf
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b p-2">
          <div className="font-bold sm:w-72">Is report completed?</div>
          <div className="flex gap-2">
            {completedOn ? (
              <Check className="text-success" />
            ) : (
              <Xmark className="text-error" />
            )}
            {completedOn && dayjs(completedOn).format("MMMM D, YYYY")}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b p-2">
          <div className="font-bold sm:w-72">Is report signed off?</div>
          <div className="flex gap-2">
            {signedOffOn ? (
              <Check className="text-success" />
            ) : (
              <Xmark className="text-error" />
            )}
            {signedOffOn && dayjs(signedOffOn).format("MMMM D, YYYY")}
          </div>
        </div>
      </div>
    </>
  );
}
