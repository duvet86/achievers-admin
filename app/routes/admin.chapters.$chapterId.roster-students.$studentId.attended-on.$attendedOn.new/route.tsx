import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { redirect } from "react-router";
import { Form, useLoaderData, useSearchParams } from "react-router";
import dayjs from "dayjs";
import invariant from "tiny-invariant";

import { Title, SubmitFormButton, SelectSearch } from "~/components";

import {
  createSessionAsync,
  getChapterByIdAsync,
  getMentorsForStudentAsync,
  getSessionsByDateAsync,
  getStudentByIdAsync,
  getStudentSessionByDateAsync,
} from "./services.server";
import { Xmark } from "iconoir-react";

export async function loader({ params, request }: LoaderFunctionArgs) {
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

    throw redirect(
      `/admin/student-sessions/${studentSession.id}/remove?${url.searchParams}`,
    );
  }

  const [chapter, sessionsForDate] = await Promise.all([
    getChapterByIdAsync(Number(params.chapterId)),
    getSessionsByDateAsync(Number(params.chapterId), params.attendedOn),
  ]);

  const student = await getStudentByIdAsync(selectedStudentId);

  const mentors = await getMentorsForStudentAsync(
    Number(params.chapterId),
    selectedStudentId,
  );

  const mentorsInSession = sessionsForDate.map(
    ({ mentorId: userId }) => userId,
  );

  return {
    chapter,
    student,
    mentors: mentors.map(({ id, fullName }) => {
      const isUnavailable = mentorsInSession.includes(id);

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
  invariant(params.studentId, "studentId not found");

  const formData = await request.formData();
  const mentorId = formData.get("mentorId");

  invariant(mentorId, "mentorId not found");

  await createSessionAsync({
    attendedOn: params.attendedOn,
    chapterId: Number(params.chapterId),
    mentorId: Number(mentorId),
    studentId: Number(params.studentId),
  });

  const url = new URL(request.url);
  const backURL = url.searchParams.get("back_url");

  if (backURL) {
    throw redirect(backURL);
  }

  throw redirect(`/admin/chapters/${params.chapterId}/roster-students`);
}

export default function Index() {
  const { attendedOnLabel, chapter, student, mentors } =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const backURL = searchParams.get("back_url");

  return (
    <>
      <Title
        to={backURL ?? `/admin/student-sessions?${searchParams.toString()}`}
      >
        Session of &quot;
        {attendedOnLabel}&quot;
      </Title>

      <Form method="POST" className="my-8 flex flex-col gap-12">
        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">Session</div>
          <div className="flex-1">{attendedOnLabel}</div>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">Chapter</div>
          <div className="flex-1">{chapter.name}</div>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">Mentor</div>
          <div className="flex flex-1 items-end gap-4">
            <SelectSearch
              name="mentorId"
              placeholder="Select a mentor"
              options={mentors}
              required
              showClearButton
            />

            <SubmitFormButton />
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">Student</div>
          <div className="flex-1">{student.fullName}</div>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">Has report?</div>
          <div className="flex-1">
            <Xmark className="text-error" />
          </div>
        </div>
        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">Is report completed?</div>
          <div className="flex-1">
            <Xmark className="text-error" />
          </div>
        </div>
        <div className="flex items-center gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">Is report signed off?</div>
          <div className="flex-1">
            <Xmark className="text-error" />
          </div>
        </div>
      </Form>
    </>
  );
}
