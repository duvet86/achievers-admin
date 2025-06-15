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

      <div className="my-8 flex flex-col gap-12">
        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">Chapter</div>
          <div className="flex-1">{chapter.name}</div>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">Session</div>
          <div className="flex-1">{attendedOnLabel}</div>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">Student</div>
          <div className="flex-1">{student.fullName}</div>

          <Link
            className="btn btn-error w-full sm:w-48"
            to={`/admin/chapters/${params.chapterId}/roster-students/${params.studentId}/attended-on/${params.attendedOn}/unavailable`}
          >
            <UserXmark />
            Mark as unavailable
          </Link>
        </div>

        <div className="flex items-center gap-2 p-2">
          <div className="w-72 font-bold">Mentor</div>

          <Form method="POST" className="flex flex-1 items-end gap-4">
            <SelectSearch
              name="mentorId"
              placeholder="Select a mentor"
              options={mentors}
              required
              showClearButton
            />

            <button
              className="btn btn-primary w-48 gap-2"
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
