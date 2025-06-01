import type { Route } from "./+types/route";

import { Form, redirect } from "react-router";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import { BookmarkBook, InfoCircle } from "iconoir-react";

import { Textarea, Title } from "~/components";

import {
  deleteStudentSessionAsync,
  getChapterByIdAsync,
  getStudentSessionByIdAsync,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentSessionId, "studentSessionId not found");

  const [chapter, session] = await Promise.all([
    getChapterByIdAsync(Number(params.chapterId)),
    getStudentSessionByIdAsync(Number(params.studentSessionId)),
  ]);

  return {
    chapter,
    session,
    attendedOnLabel: dayjs(session.attendedOn).format("MMMM D, YYYY"),
  };
}

export async function action({ params }: Route.ActionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentSessionId, "studentSessionId not found");

  const studentSession = await deleteStudentSessionAsync(
    Number(params.studentSessionId),
  );

  return redirect(
    `/admin/chapters/${studentSession.chapterId}/roster-students/${studentSession.studentId}/attended-on/${dayjs(studentSession.attendedOn).format("YYYY-MM-DD")}/new`,
  );
}

export default function Index({
  loaderData: { attendedOnLabel, chapter, session },
}: Route.ComponentProps) {
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`Are you sure?`)) {
      event.preventDefault();
      return;
    }
  };

  return (
    <>
      <Title>
        Session of &quot;
        {attendedOnLabel}&quot;
      </Title>

      <Form
        method="POST"
        className="my-8 flex flex-col gap-6"
        onSubmit={handleFormSubmit}
      >
        <div className="flex items-center justify-between gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">Chapter</div>
          <div className="flex-1">{chapter.name}</div>
        </div>

        <div className="flex items-center justify-between gap-2 border-b border-gray-300 p-2">
          <div className="font-bold sm:w-72">Session</div>
          <div className="sm:flex-1">{attendedOnLabel}</div>
        </div>

        <div className="flex items-center justify-between gap-2 border-b border-gray-300 p-2">
          <div className="font-bold sm:w-72">Student</div>
          <div className="sm:flex-1">{session.student.fullName}</div>
        </div>

        {session.status === "UNAVAILABLE" && (
          <>
            <div className="flex items-center justify-between gap-4">
              <p className="alert alert-error w-full">
                <InfoCircle />
                Student is marked as unavailable for this session
              </p>

              <button
                className="btn btn-secondary w-full sm:w-48"
                type="submit"
              >
                <BookmarkBook />
                Restore
              </button>
            </div>

            <Textarea
              label="Reason"
              name="reason"
              readOnly
              disabled
              defaultValue={session.reason!}
            />
          </>
        )}
      </Form>
    </>
  );
}
