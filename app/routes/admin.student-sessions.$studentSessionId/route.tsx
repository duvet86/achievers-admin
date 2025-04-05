import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { redirect } from "react-router";
import { useLoaderData, useSubmit } from "react-router";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import classNames from "classnames";
import {
  EditPencil,
  Trash,
  UserXmark,
  WarningTriangle,
  Xmark,
} from "iconoir-react";

import { StateLink, Textarea, Title } from "~/components";

import {
  getChapterByIdAsync,
  getStudentSessionByIdAsync,
  removeSessionAsync,
} from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
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
  };
}

export async function action({ params, request }: ActionFunctionArgs) {
  invariant(params.studentSessionId, "studentSessionId not found");

  const studentSession = await removeSessionAsync(
    Number(params.studentSessionId),
  );

  const url = new URL(request.url);

  return redirect(
    `/admin/chapters/${studentSession.session.chapterId}/roster-students/${studentSession.studentId}/attended-on/${dayjs(studentSession.session.attendedOn).format("YYYY-MM-DD")}/new?${url.searchParams}`,
  );
}

export default function Index() {
  const { attendedOnLabel, chapter, studentSession } =
    useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleRemoveMentorSubmit = () => {
    if (!confirm(`Are you sure?`)) {
      return;
    }
    void submit(null, {
      method: "DELETE",
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
          Session of &quot;
          {attendedOnLabel}&quot;
        </Title>

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
              Remove
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
