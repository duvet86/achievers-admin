import type { Route } from "./+types/route";

import { Form, Link, redirect } from "react-router";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import { FloppyDiskArrowIn, UserXmark } from "iconoir-react";

import { Title, SelectSearch } from "~/components";

import {
  createSessionAsync,
  getChapterByIdAsync,
  getMentorsForStudentAsync,
  getStudentByIdAsync,
  getStudentSessionByDateAsync,
} from "./services.server";

export async function loader({ params, request }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentId, "studentId not found");
  invariant(params.attendedOn, "attendedOn not found");

  const selectedStudentId = Number(params.studentId);

  const studentSession = await getStudentSessionByDateAsync(
    Number(params.chapterId),
    selectedStudentId,
    params.attendedOn,
  );

  if (studentSession !== null) {
    const url = new URL(request.url);

    return redirect(
      `/admin/chapters/${params.chapterId}/roster-students/student-sessions/${studentSession.id}?${url.searchParams}`,
    );
  }

  const chapter = await getChapterByIdAsync(Number(params.chapterId));

  const student = await getStudentByIdAsync(selectedStudentId);
  const mentors = await getMentorsForStudentAsync(
    Number(params.chapterId),
    selectedStudentId,
    params.attendedOn,
  );

  return {
    chapter,
    student,
    mentors,
    attendedOnLabel: dayjs(params.attendedOn, "YYYY-MM-DD").format(
      "MMMM D, YYYY",
    ),
  };
}

export async function action({ params, request }: Route.ActionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.attendedOn, "attendedOn not found");
  invariant(params.studentId, "studentId not found");

  const formData = await request.formData();
  const status = formData.get("status")!;
  const selectedMentorId = formData.get("mentorId");

  const { id } = await createSessionAsync({
    attendedOn: params.attendedOn,
    chapterId: Number(params.chapterId),
    mentorId: selectedMentorId ? Number(selectedMentorId) : null,
    studentId: Number(params.studentId),
    status: status.toString(),
  });

  const url = new URL(request.url);

  return redirect(
    `/admin/chapters/${params.chapterId}/roster-students/student-sessions/${id}?${url.searchParams}`,
  );
}

export default function Index({
  params,
  loaderData: { attendedOnLabel, chapter, student, mentors },
}: Route.ComponentProps) {
  return (
    <>
      <Title>
        Student session of &quot;
        {attendedOnLabel}&quot;
      </Title>

      <div className="my-8 flex flex-col gap-6">
        <div className="flex items-center border-b border-gray-300 p-2">
          <div className="w-full font-bold sm:w-72">Chapter</div>
          <div className="shrink-0">{chapter.name}</div>
        </div>

        <div className="flex items-center border-b border-gray-300 p-2">
          <div className="w-full font-bold sm:w-72">Session</div>
          <div className="shrink-0">{attendedOnLabel}</div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-300 p-2">
          <div className="flex grow">
            <div className="w-full font-bold sm:w-72">Student</div>
            <div className="shrink-0">{student.fullName}</div>
          </div>

          <Link
            className="btn btn-error btn-block sm:w-48"
            to={`/admin/chapters/${params.chapterId}/roster-students/${params.studentId}/attended-on/${params.attendedOn}/unavailable`}
          >
            <UserXmark />
            Mark as unavailable
          </Link>
        </div>

        <div className="flex flex-col gap-4 p-2 sm:flex-row sm:items-center">
          <div className="font-bold sm:w-72">Mentor</div>

          <Form method="POST" className="flex w-full flex-wrap gap-4">
            <SelectSearch
              className="flex-1"
              name="mentorId"
              placeholder="Select a mentor"
              options={mentors}
              required
              showClearButton
            />

            <button
              className="btn btn-primary btn-block sm:w-48"
              type="submit"
              name="status"
              value="AVAILABLE"
            >
              <FloppyDiskArrowIn />
              Book
            </button>
          </Form>
        </div>
      </div>
    </>
  );
}
