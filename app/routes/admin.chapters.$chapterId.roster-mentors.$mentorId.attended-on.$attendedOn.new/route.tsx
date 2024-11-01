import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import dayjs from "dayjs";
import invariant from "tiny-invariant";

import { Title, SelectSearch } from "~/components";

import {
  createSessionAsync,
  getChapterByIdAsync,
  getStudentsForMentorAsync,
  getSessionsByDateAsync,
  getMentorByIdAsync,
} from "./services.server";
import { FloppyDiskArrowIn, Xmark } from "iconoir-react";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.attendedOn, "attendedOn not found");
  invariant(params.mentorId, "mentorId not found");

  const selectedMentorId = Number(params.mentorId);

  const [chapter, sessionsForDate] = await Promise.all([
    getChapterByIdAsync(Number(params.chapterId)),
    getSessionsByDateAsync(Number(params.chapterId), params.attendedOn),
  ]);

  const mentor = await getMentorByIdAsync(selectedMentorId);
  const students = await getStudentsForMentorAsync(
    Number(params.chapterId),
    selectedMentorId,
  );

  const studentsInSession = sessionsForDate
    .filter(({ studentSession }) => studentSession.length > 0)
    .map(({ studentSession }) => studentSession[0].student.id);

  return {
    chapter,
    mentor,
    students: students.map(({ id, fullName }) => {
      const isUnavailable = studentsInSession.includes(id);

      return {
        label:
          fullName +
          (isUnavailable ? " (Unavailable - in another session)" : ""),
        value: id.toString(),
        isDisabled: isUnavailable,
      };
    }),
    attendedOnLabel: dayjs(params.attendedOn, "YYYY-MM-DD").format(
      "MMMM D, YYYY",
    ),
  };
}

export async function action({ params, request }: ActionFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.attendedOn, "attendedOn not found");
  invariant(params.mentorId, "mentorId not found");

  const formData = await request.formData();
  const selectedStudentId = formData.get("studentId");

  await createSessionAsync({
    attendedOn: params.attendedOn,
    chapterId: Number(params.chapterId),
    mentorId: Number(params.mentorId),
    studentId: selectedStudentId ? Number(selectedStudentId) : null,
  });

  const url = new URL(request.url);
  const backURL = url.searchParams.get("back_url");

  if (backURL) {
    return redirect(backURL);
  }

  return redirect(`/admin/chapters/${params.chapterId}/roster-mentors`);
}

export default function Index() {
  const { attendedOnLabel, chapter, mentor, students } =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const backURL = searchParams.get("back_url");

  return (
    <>
      <Title
        to={
          backURL
            ? backURL
            : `/admin/student-sessions?${searchParams.toString()}`
        }
      >
        Session of &quot;
        {attendedOnLabel}&quot;
      </Title>

      <div className="my-8 flex flex-col gap-12">
        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Chapter</div>
          <div className="flex-1">{chapter.name}</div>
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Session</div>
          <div className="flex-1">{attendedOnLabel}</div>
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Mentor</div>
          <div className="flex-1">{mentor.fullName}</div>
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Student</div>

          <div className="flex flex-1 flex-col items-center border-opacity-50">
            <Form method="POST" className="flex w-full items-end gap-4">
              <SelectSearch
                name="studentId"
                placeholder="Select a student"
                options={students}
                required
                showClearButton
              />

              <button className="btn btn-primary w-48 gap-2" type="submit">
                <FloppyDiskArrowIn />
                Book
              </button>
            </Form>

            <div className="divider">OR</div>

            <Form method="POST">
              <button className="btn btn-info w-48 gap-2" type="submit">
                <FloppyDiskArrowIn />
                Set available
              </button>
            </Form>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Has report?</div>
          <div className="flex-1">
            <Xmark className="h-6 w-6 text-error" />
          </div>
        </div>
        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Is report completed?</div>
          <div className="flex-1">
            <Xmark className="h-6 w-6 text-error" />
          </div>
        </div>
        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Is report signed off?</div>
          <div className="flex-1">
            <Xmark className="h-6 w-6 text-error" />
          </div>
        </div>
      </div>
    </>
  );
}
