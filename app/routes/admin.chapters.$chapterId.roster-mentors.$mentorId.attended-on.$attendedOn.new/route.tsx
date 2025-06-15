import type { Route } from "./+types/route";

import { Form, redirect } from "react-router";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import { Check, FloppyDiskArrowIn, Xmark } from "iconoir-react";

import { Title, SelectSearch } from "~/components";

import {
  createSessionAsync,
  getChapterByIdAsync,
  getStudentsForMentorAsync,
  getMentorByIdAsync,
  getMentorSessionForDateAsync,
} from "./services.server";

export async function loader({ params, request }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.mentorId, "mentorId not found");
  invariant(params.attendedOn, "attendedOn not found");

  const selectedMentorId = Number(params.mentorId);

  const mentorSession = await getMentorSessionForDateAsync(
    Number(params.chapterId),
    Number(params.mentorId),
    params.attendedOn,
  );

  if (mentorSession !== null) {
    const url = new URL(request.url);

    return redirect(
      `/admin/chapters/${params.chapterId}/roster-mentors/mentor-sessions/${mentorSession.id}?${url.searchParams}`,
    );
  }

  const chapter = await getChapterByIdAsync(Number(params.chapterId));

  const mentor = await getMentorByIdAsync(selectedMentorId);
  const students = await getStudentsForMentorAsync(
    Number(params.chapterId),
    selectedMentorId,
    params.attendedOn,
  );

  return {
    chapter,
    mentor,
    students,
    attendedOnLabel: dayjs(params.attendedOn, "YYYY-MM-DD").format(
      "MMMM D, YYYY",
    ),
  };
}

export async function action({ params, request }: Route.ActionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.attendedOn, "attendedOn not found");
  invariant(params.mentorId, "mentorId not found");

  const formData = await request.formData();
  const status = formData.get("status")!;
  const selectedStudentId = formData.get("studentId");

  const { id } = await createSessionAsync({
    attendedOn: params.attendedOn,
    chapterId: Number(params.chapterId),
    mentorId: Number(params.mentorId),
    studentId: selectedStudentId ? Number(selectedStudentId) : null,
    status: status.toString(),
  });

  const url = new URL(request.url);

  return redirect(
    `/admin/chapters/${params.chapterId}/roster-mentors/mentor-sessions/${id}?${url.searchParams}`,
  );
}

export default function Index({
  loaderData: { attendedOnLabel, chapter, mentor, students },
}: Route.ComponentProps) {
  return (
    <>
      <Title>
        Mentor session of &quot;
        {attendedOnLabel}&quot;
      </Title>

      <div className="my-8 flex flex-col gap-6">
        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">Chapter</div>
          <div className="flex-1">{chapter.name}</div>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">Session</div>
          <div className="flex-1">{attendedOnLabel}</div>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">Mentor</div>
          <div className="flex-1">{mentor.fullName}</div>

          <div className="border-opacity-50 flex flex-1 flex-col items-center">
            <Form method="POST" className="w-full">
              <button
                className="btn btn-info btn-block gap-2"
                type="submit"
                name="status"
                value="AVAILABLE"
              >
                <Check />
                Available
              </button>
            </Form>

            <div className="divider">OR</div>

            <Form method="POST" className="w-full">
              <button
                className="btn btn-error btn-block gap-2"
                type="submit"
                name="status"
                value="UNAVAILABLE"
              >
                <Xmark />
                Unavailable
              </button>
            </Form>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2">
          <div className="w-72 font-bold">Student</div>

          <Form method="POST" className="flex w-full items-end gap-4">
            <SelectSearch
              name="studentId"
              placeholder="Select a student"
              options={students}
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
