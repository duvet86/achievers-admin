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
            <div className="w-full font-bold sm:w-72">Mentor</div>
            <div className="shrink-0">{mentor.fullName}</div>
          </div>

          <Form
            method="POST"
            className="flex grow flex-col items-center justify-end sm:flex-row"
          >
            <button
              className="btn btn-info btn-block sm:w-48"
              type="submit"
              name="status"
              value="AVAILABLE"
            >
              <Check />
              Mark as available
            </button>

            <div className="divider sm:divider-horizontal">OR</div>

            <button
              className="btn btn-error btn-block sm:w-48"
              type="submit"
              name="status"
              value="UNAVAILABLE"
            >
              <Xmark />
              Mark as unavailable
            </button>
          </Form>
        </div>

        <div className="flex flex-col gap-4 p-2 sm:flex-row sm:items-center">
          <div className="font-bold sm:w-72">Student</div>

          <Form method="POST" className="flex w-full flex-wrap gap-4">
            <SelectSearch
              className="flex-1"
              name="studentId"
              placeholder="Select a student"
              options={students}
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
