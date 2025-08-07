import type { Route } from "./+types/route";

import { Form, redirect } from "react-router";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import classNames from "classnames";
import {
  EditPencil,
  WarningTriangle,
  Xmark,
  SendMail,
  UserXmark,
  UserPlus,
} from "iconoir-react";

import { getEnvironment } from "~/services";
import { Editor, Input, Message, StateLink, Title } from "~/components";

import editorStylesheetUrl from "~/styles/editor.css?url";

import {
  getChapterByIdAsync,
  getNotificationSentOnFromNow,
  getSessionByIdAsync,
} from "./services.server";

export const links: Route.LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStylesheetUrl }];
};

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.sessionId, "sessionId not found");

  const session = await getSessionByIdAsync(Number(params.sessionId));

  if (session.completedOn) {
    return redirect(`/admin/sessions/${session.id}/report`);
  }

  const chapter = await getChapterByIdAsync(Number(session.chapterId));

  return {
    chapter,
    session,
    attendedOnLabel: dayjs(session.attendedOn).format("MMMM D, YYYY"),
    notificationSentOnFromNow: getNotificationSentOnFromNow(
      session.notificationSentOn,
    ),
  };
}

export async function action({ params, request }: Route.ActionArgs) {
  invariant(params.sessionId, "sessionId not found");

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
      sessionId: Number(params.sessionId),
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

export default function Index({
  loaderData: { attendedOnLabel, chapter, session, notificationSentOnFromNow },
  actionData,
}: Route.ComponentProps) {
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm("Are you sure you want to send a notification email?")) {
      e.preventDefault();
      return;
    }
  };

  return (
    <>
      <div
        className={classNames(
          "flex flex-col justify-between gap-2 sm:flex-row",
          {
            "text-error": session.cancelledAt !== null,
          },
        )}
      >
        <Title>
          Session of &quot;
          {attendedOnLabel}&quot;
        </Title>

        <Message
          key={Date.now()}
          errorMessage={actionData?.errorMessage}
          successMessage={actionData?.successMessage}
        />

        {session.cancelledAt && (
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
            {session.mentorSession.mentor.fullName}
          </div>

          {!session.completedOn && !session.cancelledAt && (
            <StateLink
              className="btn btn-error w-full sm:w-48"
              to="cancel/mentor"
            >
              <UserXmark />
              Mark absent
            </StateLink>
          )}

          <StateLink
            to={`/admin/chapters/${chapter.id}/roster-mentors/mentor-sessions/${session.mentorSession.id}`}
            className="btn w-full sm:w-48"
          >
            <UserPlus />
            Menage mentor
          </StateLink>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="font-bold sm:w-72">Student</div>
          <div className="sm:flex-1">
            {session.studentSession.student.fullName}
          </div>

          {!session.completedOn && !session.cancelledAt && (
            <StateLink
              className="btn btn-error w-full sm:w-48"
              to="cancel/student"
            >
              <UserXmark />
              Mark absent
            </StateLink>
          )}

          <StateLink
            to={`/admin/chapters/${chapter.id}/roster-students/student-sessions/${session.studentSession.id}`}
            className="btn w-full sm:w-48"
          >
            <UserPlus />
            Menage student
          </StateLink>
        </div>

        {!session.cancelledAt ? (
          <>
            <Form
              method="POST"
              onSubmit={handleFormSubmit}
              className="flex flex-wrap items-center gap-4 border-b border-gray-300 p-2"
            >
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
                type="submit"
              >
                <SendMail /> Send notification
              </button>

              <StateLink
                to={`/admin/sessions/${session.id}/write-report`}
                className="btn btn-success w-full gap-2 sm:w-48"
              >
                <EditPencil /> Report on behalf
              </StateLink>
            </Form>

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
            <div className="flex flex-col gap-2 sm:flex-1">
              <p>
                {session.cancelledBecauseOf === "STUDENT"
                  ? "Student was"
                  : session.cancelledBecauseOf === "MENTOR"
                    ? "Mentor was"
                    : ""}
              </p>

              <Input defaultValue={session.cancelledReason?.reason} readOnly />

              <Editor isReadonly initialEditorStateType={session.report} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
