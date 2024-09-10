import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import dayjs from "dayjs";
import invariant from "tiny-invariant";

import { Title, SubmitFormButton, SelectSearch } from "~/components";

import {
  createSessionAsync,
  getChapterByIdAsync,
  getStudentsForMentorAsync,
  getMentorsForStudentAsync,
  getSessionsByDateAsync,
  getMentorByIdAsync,
  getStudentByIdAsync,
} from "./services.server";
import { Xmark } from "iconoir-react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.attendedOn, "attendedOn not found");
  invariant(params.chapterId, "chapterId not found");

  const url = new URL(request.url);

  const fixedMentorId = url.searchParams.get("fixedMentorId");
  const fixedStudentId = url.searchParams.get("fixedStudentId");

  const selectedMentorId = fixedMentorId ? Number(fixedMentorId) : null;
  const selectedStudentId = fixedStudentId ? Number(fixedStudentId) : null;

  const [chapter, sessionsForDate] = await Promise.all([
    getChapterByIdAsync(Number(params.chapterId)),
    getSessionsByDateAsync(Number(params.chapterId), params.attendedOn),
  ]);

  if (selectedMentorId) {
    const mentor = await getMentorByIdAsync(selectedMentorId);

    const students = await getStudentsForMentorAsync(
      Number(params.chapterId),
      selectedMentorId,
    );

    const studentsInSession = sessionsForDate.map(({ studentId }) => studentId);

    return json({
      chapter,
      mentor,
      mentors: null,
      student: null,
      students: students
        .filter(({ id }) => !studentsInSession.includes(id))
        .map(({ id, fullName }) => ({
          label: fullName,
          value: id.toString(),
        })),
      attendedOnLabel: dayjs(params.attendedOn, "YYYY-MM-DD").format(
        "MMMM D, YYYY",
      ),
    });
  }

  if (selectedStudentId) {
    const student = await getStudentByIdAsync(selectedStudentId);

    const mentors = await getMentorsForStudentAsync(
      Number(params.chapterId),
      selectedStudentId,
    );

    const mentorsInSession = sessionsForDate.map(({ userId }) => userId);

    return json({
      chapter,
      student,
      students: null,
      mentor: null,
      mentors: mentors
        .filter(({ id }) => !mentorsInSession.includes(id))
        .map(({ id, fullName }) => ({
          label: fullName,
          value: id.toString(),
        })),
      attendedOnLabel: dayjs(params.attendedOn, "YYYY-MM-DD").format(
        "MMMM D, YYYY",
      ),
    });
  }
}

export async function action({ params, request }: ActionFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.attendedOn, "attendedOn not found");

  const url = new URL(request.url);

  const fixedMentorId = url.searchParams.get("fixedMentorId");
  const fixedStudentId = url.searchParams.get("fixedStudentId");

  const formData = await request.formData();
  const selectedMentorId = fixedMentorId ?? formData.get("mentorId");
  const selectedStudentId = fixedStudentId ?? formData.get("studentId");

  invariant(selectedMentorId, "selectedMentorId not found");
  invariant(selectedStudentId, "selectedStudentId not found");

  const session = await createSessionAsync({
    attendedOn: params.attendedOn,
    chapterId: Number(params.chapterId),
    mentorId: Number(selectedMentorId),
    studentId: Number(selectedStudentId),
  });

  const backURL = url.searchParams.get("back_url");

  if (backURL) {
    return redirect(backURL);
  }

  return redirect(
    `/admin/sessions/${session.id}?${url.searchParams.toString()}`,
  );
}

export default function Index() {
  const { attendedOnLabel, chapter, mentor, student, mentors, students } =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const backURL = searchParams.get("back_url");

  return (
    <>
      <Title
        to={backURL ? backURL : `/admin/sessions?${searchParams.toString()}`}
      >
        Session of &quot;
        {attendedOnLabel}&quot;
      </Title>

      <Form method="POST" className="my-8 flex flex-col gap-12">
        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Session</div>
          <div className="flex-1">{attendedOnLabel}</div>
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Chapter</div>
          <div className="flex-1">{chapter.name}</div>
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Mentor</div>
          {mentor ? (
            <div className="flex-1">{mentor.fullName}</div>
          ) : (
            <div className="flex flex-1 items-end gap-4">
              <SelectSearch
                name="mentorId"
                placeholder="Select a mentor"
                options={mentors}
                required
              />

              <SubmitFormButton />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Student</div>
          {student ? (
            <div className="flex-1">{student.fullName}</div>
          ) : (
            <div className="flex flex-1 items-end gap-4">
              <SelectSearch
                name="studentId"
                placeholder="Select a student"
                options={students}
                required
              />

              <SubmitFormButton />
            </div>
          )}
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
      </Form>
    </>
  );
}
