import type { Route } from "./+types/route";

import { redirect, useSubmit } from "react-router";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import classNames from "classnames";
import {
  EditPencil,
  Trash,
  UserXmark,
  WarningTriangle,
  Xmark,
  SendMail,
} from "iconoir-react";

import { getEnvironment } from "~/services";
import { Message, StateLink, Textarea, Title } from "~/components";

import {
  getChapterByIdAsync,
  getNotificationSentOnFromNow,
  getStudentSessionByIdAsync,
  removeSessionAsync,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.studentSessionId, "studentSessionId not found");

  const studentSession = await getStudentSessionByIdAsync(
    Number(params.studentSessionId),
  );

  if (studentSession.completedOn) {
    throw redirect(`/admin/student-sessions/${studentSession.id}/report`);
  }

  const chapter = await getChapterByIdAsync(
    Number(studentSession.session.chapterId),
  );

  return {
    chapter,
    studentSession,
    attendedOnLabel: dayjs(studentSession.session.attendedOn).format(
      "MMMM D, YYYY",
    ),
    notificationSentOnFromNow: getNotificationSentOnFromNow(
      studentSession.notificationSentOn,
    ),
  };
}

export async function action({ params, request }: Route.ActionArgs) {
  invariant(params.studentSessionId, "studentSessionId not found");

  if (request.method === "DELETE") {
    const studentSession = await removeSessionAsync(
      Number(params.studentSessionId),
    );

    const url = new URL(request.url);

    return redirect(
      `/admin/chapters/${studentSession.session.chapterId}/roster-students/${studentSession.studentId}/attended-on/${dayjs(studentSession.session.attendedOn).format("YYYY-MM-DD")}/new?${url.searchParams}`,
    );
  }

  if (request.method === "POST") {
    const environment = getEnvironment(request);

    if (environment !== "production") {
      return {
        successMessage: "TEST ENVIRONMENT: Notification email sent",
        errorMessage: null,
      };
    }

    const resp = await fetch(process.env.SEND_MENTOR_REPORT_REMINDER_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentSessionId: Number(params.studentSessionId),
      }),
    });

    if (!resp.ok) {
      return {
        successMessage: null,
        errorMessage: "Failed to send notification email",
      };
    }

    return {
      successMessage: "Notification email sent",
      errorMessage: null,
    };
  }

  throw new Error("Method not allowed");
}

export default function Index({
  loaderData: {
    attendedOnLabel,
    chapter,
    studentSession,
    notificationSentOnFromNow,
  },
  actionData,
}: Route.ComponentProps) {
  const submit = useSubmit();

  const handleRemoveMentorSubmit = () => {
    if (!confirm(`Are you sure?`)) {
      return;
    }
    void submit(null, {
      method: "DELETE",
    });
  };

  const sendNotification = () => {
    if (!confirm("Are you sure you want to send a notification email?")) {
      return;
    }

    void submit(null, {
      method: "POST",
    });
  };

  return (
    <>
      <div
        className={classNames(
          "flex flex-col justify-between gap-2 sm:flex-row",
          {
            "text-error": studentSession.cancelledAt !== null,
          },
        )}
      >
        <Title>
          Session for &quot;{studentSession.student.fullName}&quot; on &quot;
          {attendedOnLabel}&quot;
        </Title>

        <Message
          key={Date.now()}
          errorMessage={actionData?.errorMessage}
          successMessage={actionData?.successMessage}
        />

        {!studentSession.cancelledAt ? (
          <StateLink className="btn btn-error w-full sm:w-48" to="cancel">
            <Trash />
            Cancel session
          </StateLink>
        ) : (
          <div className="alert alert-error w-48">
            <WarningTriangle /> Session cancelled
          </div>
        )}
      </div>

      <div className="my-8 flex flex-col gap-12">
        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="font-bold sm:w-72">Chapter</div>
          <div className="sm:flex-1">{chapter.name}</div>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="font-bold sm:w-72">Session</div>
          <div className="sm:flex-1">{attendedOnLabel}</div>
        </div>

        <div className="flex flex-col gap-2 border-b border-gray-300 p-2 sm:flex-row sm:items-center">
          <div className="w-72 font-bold">Mentor</div>
          <div className="sm:flex-1">
            {studentSession.session.mentor.fullName}
          </div>

          {!studentSession.cancelledAt && (
            <button
              className="btn btn-error w-full sm:w-48"
              type="button"
              onClick={handleRemoveMentorSubmit}
            >
              <UserXmark />
              Remove Mentor
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="font-bold sm:w-72">Student</div>
          <div className="sm:flex-1">{studentSession.student.fullName}</div>
        </div>

        {!studentSession.cancelledAt ? (
          <>
            <div className="flex flex-wrap items-center gap-4 border-b border-gray-300 p-2">
              <div className="font-bold sm:w-72">Has report?</div>
              <div className="sm:flex-1">
                <Xmark className="text-error" />
              </div>

              {notificationSentOnFromNow && (
                <p className="text-info">
                  Last notification sent {notificationSentOnFromNow}
                </p>
              )}

              <button
                className="btn btn-warning w-full gap-2 sm:w-48"
                onClick={sendNotification}
              >
                <SendMail /> Send notification
              </button>

              <StateLink
                to={`/admin/student-sessions/${studentSession.id}/mentors/${studentSession.session.mentor.id}/write-report`}
                className="btn btn-success w-full gap-2 sm:w-48"
              >
                <EditPencil /> Report on behalf
              </StateLink>
            </div>

            <div className="flex items-center gap-4 border-b border-gray-300 p-2">
              <div className="font-bold sm:w-72">Is report completed?</div>
              <div className="sm:flex-1">
                <Xmark className="text-error" />
              </div>
            </div>

            <div className="items-centerd flex gap-4 border-b border-gray-300 p-2">
              <div className="font-bold sm:w-72">Is report signed off?</div>
              <div className="sm:flex-1">
                <Xmark className="text-error" />
              </div>
            </div>
          </>
        ) : (
          <div className="items-centerd flex gap-4 p-2">
            <div className="text-error font-bold sm:w-72">Cancel reason</div>
            <div className="sm:flex-1">
              <Textarea
                readOnly
                defaultValue={studentSession.cancelledReason!}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
