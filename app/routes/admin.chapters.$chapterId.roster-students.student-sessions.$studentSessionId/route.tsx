import type { Route } from "./+types/route";

import { useSubmit } from "react-router";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import { BookmarkBook, InfoCircle } from "iconoir-react";

import { Message, Textarea, Title } from "~/components";

import {
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

export function action({ params }: Route.ActionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentSessionId, "studentSessionId not found");

  // const formData = await request.formData();

  return {
    successMessage: "Session updated successfully",
  };
}

export default function Index({
  loaderData: { attendedOnLabel, chapter, session },
  actionData,
}: Route.ComponentProps) {
  const submit = useSubmit();

  const handleRestoreUnavailableSession = () => {
    if (!confirm(`Are you sure?`)) {
      return;
    }

    const formData = new FormData();
    formData.append("action", "restore");

    void submit(formData, {
      method: "POST",
    });
  };

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Title>
          Session of &quot;
          {attendedOnLabel}&quot;
        </Title>

        <Message key={Date.now()} successMessage={actionData?.successMessage} />
      </div>

      <div className="my-8 flex flex-col gap-6">
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
                type="button"
                onClick={handleRestoreUnavailableSession}
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

        {session.status === "AVAILABLE" && (
          <div className="flex items-center justify-between gap-4">
            <p className="alert alert-error w-full">
              <InfoCircle />
              Student is marked as available for this session
            </p>

            <button
              className="btn btn-secondary w-full sm:w-48"
              type="button"
              onClick={handleRestoreUnavailableSession}
            >
              <BookmarkBook />
              Mark unavailable
            </button>
          </div>
        )}
      </div>
    </>
  );
}
