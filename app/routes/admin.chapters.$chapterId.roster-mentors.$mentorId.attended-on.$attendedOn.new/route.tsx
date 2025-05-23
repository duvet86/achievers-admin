import type { Route } from "./+types/route";

import { redirect } from "react-router";
import { Form } from "react-router";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import { FloppyDiskArrowIn, Xmark } from "iconoir-react";

import { Title, SelectSearch } from "~/components";

import {
  createSessionAsync,
  getChapterByIdAsync,
  getStudentsForMentorAsync,
  getMentorByIdAsync,
  getSessionForDateAsync,
} from "./services.server";

export async function loader({ params, request }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.mentorId, "mentorId not found");
  invariant(params.attendedOn, "attendedOn not found");

  const selectedMentorId = Number(params.mentorId);

  const session = await getSessionForDateAsync(
    Number(params.chapterId),
    Number(params.mentorId),
    params.attendedOn,
  );

  if (session !== null) {
    const url = new URL(request.url);

    throw redirect(
      `/admin/chapters/${params.chapterId}/roster-mentors/sessions/${session.id}?${url.searchParams}`,
    );
  }

  const chapter = await getChapterByIdAsync(Number(params.chapterId));

  const mentor = await getMentorByIdAsync(selectedMentorId);
  const students = await getStudentsForMentorAsync(
    Number(params.chapterId),
    selectedMentorId,
  );

  return {
    chapter,
    mentor,
    students: students.map(({ id, fullName }) => ({
      label: fullName,
      value: id.toString(),
    })),
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

  throw redirect(
    `/admin/chapters/${params.chapterId}/roster-mentors/sessions/${id}?${url.searchParams}`,
  );
}

export default function Index({
  loaderData: { attendedOnLabel, chapter, mentor, students },
}: Route.ComponentProps) {
  return (
    <>
      <Title>
        Session of &quot;
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
        </div>

        <div className="flex items-center gap-2 p-2">
          <div className="w-72 font-bold">Student</div>

          <div className="border-opacity-50 flex flex-1 flex-col items-center">
            <Form method="POST" className="w-full">
              <button
                className="btn btn-info btn-block gap-2"
                type="submit"
                name="status"
                value="AVAILABLE"
              >
                <FloppyDiskArrowIn />
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

            <div className="divider">OR</div>

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
      </div>
    </>
  );
}
