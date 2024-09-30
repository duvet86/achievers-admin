import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import {
  Xmark,
  Check,
  StatsReport,
  WarningCircle,
  EditPencil,
} from "iconoir-react";

import { Title, Textarea } from "~/components";

import { getSessionByIdAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.sessionId, "sessionId not found");

  const session = await getSessionByIdAsync(Number(params.sessionId));

  return json({
    attendedOnLabel: dayjs(session.attendedOn).format("MMMM D, YYYY"),
    session,
  });
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
  const [searchParams] = useSearchParams();

  const backURL = searchParams.get("back_url");

  return (
    <>
      <div className="flex justify-between">
        <Title
          to={backURL ? backURL : `/admin/sessions?${searchParams.toString()}`}
        >
          Session of &quot;
          {attendedOnLabel}&quot;
        </Title>

        {isCancelled && (
          <div role="alert" className="alert alert-error w-72">
            <WarningCircle />
            <span>Session has been cancelled</span>
          </div>
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
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Mentor</div>
          <div className="flex-1">{user.fullName}</div>
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
