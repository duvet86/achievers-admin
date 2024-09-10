import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useLocation,
  useSearchParams,
} from "@remix-run/react";
import dayjs from "dayjs";
import invariant from "tiny-invariant";

import { Title, SubmitFormButton, SelectSearch } from "~/components";

import {
  updateSessionAsync,
  getChapterByIdAsync,
  getStudentsForMentorAsync,
  getMentorsForStudentAsync,
  getSessionsByDateAsync,
  getSessionByIdAsync,
} from "./services.server";
import { EditPencil, Xmark } from "iconoir-react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.sessionId, "sessionId not found");

  const url = new URL(request.url);

  const fixedMentorId = url.searchParams.get("fixedMentorId");
  const fixedStudentId = url.searchParams.get("fixedStudentId");

  const mentorId = fixedMentorId ? Number(fixedMentorId) : null;
  const studentId = fixedStudentId ? Number(fixedStudentId) : null;

  const session = await getSessionByIdAsync(Number(params.sessionId));

  if (session.isCancelled || session.completedOn) {
    const backURL = url.searchParams.get("back_url");

    return redirect(`/admin/sessions/${session.id}?back_url=${backURL}`);
  }

  const [chapter, sessionsForDate] = await Promise.all([
    getChapterByIdAsync(Number(params.chapterId)),
    getSessionsByDateAsync(Number(params.chapterId), session.attendedOn),
  ]);

  if (mentorId) {
    const students = await getStudentsForMentorAsync(
      Number(params.chapterId),
      mentorId,
    );

    const studentsInSession = sessionsForDate.map(({ studentId }) => studentId);
    const selectedStudentId = session.student.id;

    return json({
      chapter,
      session,
      mentors: null,
      selectedMentorId: null,
      selectedStudentId: selectedStudentId.toString(),
      students: students
        .filter(
          ({ id }) =>
            !studentsInSession.includes(id) || selectedStudentId === id,
        )
        .map(({ id, fullName }) => ({
          label: fullName,
          value: id.toString(),
        })),
      attendedOnLabel: dayjs(session.attendedOn).format("MMMM D, YYYY"),
    });
  }

  if (studentId) {
    const mentors = await getMentorsForStudentAsync(
      Number(params.chapterId),
      studentId,
    );

    const mentorsInSession = sessionsForDate.map(({ userId }) => userId);
    const selectedMentorId = session.user.id;

    return json({
      chapter,
      session,
      students: null,
      selectedMentorId: selectedMentorId.toString(),
      selectedStudentId: null,
      mentors: mentors
        .filter(
          ({ id }) => !mentorsInSession.includes(id) || selectedMentorId === id,
        )
        .map(({ id, fullName }) => ({
          label: fullName,
          value: id.toString(),
        })),
      attendedOnLabel: dayjs(session.attendedOn).format("MMMM D, YYYY"),
    });
  }
}

export async function action({ params, request }: ActionFunctionArgs) {
  invariant(params.sessionId, "sessionId not found");

  const url = new URL(request.url);

  const fixedMentorId = url.searchParams.get("fixedMentorId");
  const fixedStudentId = url.searchParams.get("fixedStudentId");

  const formData = await request.formData();
  const selectedMentorId = fixedMentorId ?? formData.get("mentorId");
  const selectedStudentId = fixedStudentId ?? formData.get("studentId");

  await updateSessionAsync({
    sessionId: Number(params.sessionId),
    mentorId: Number(selectedMentorId),
    studentId: Number(selectedStudentId),
  });

  const backURL = url.searchParams.get("back_url");

  if (backURL) {
    return redirect(backURL);
  }

  const path = fixedMentorId ? `roster-mentors` : `roster-students`;

  return redirect(`/admin/chapters/${params.chapterId}/${path}`);
}

export default function Index() {
  const {
    attendedOnLabel,
    chapter,
    session,
    mentors,
    students,
    selectedMentorId,
    selectedStudentId,
  } = useLoaderData<typeof loader>();
  const location = useLocation();
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
          {selectedMentorId ? (
            <div className="flex flex-1 items-end gap-4">
              <SelectSearch
                name="mentorId"
                placeholder="Select a mentor"
                defaultValue={selectedMentorId}
                options={mentors}
                required
              />

              <SubmitFormButton />
            </div>
          ) : (
            <div className="flex-1">{session.user.fullName}</div>
          )}
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Student</div>
          {selectedStudentId ? (
            <div className="flex flex-1 items-end gap-4">
              <SelectSearch
                name="studentId"
                placeholder="Select a student"
                defaultValue={selectedStudentId}
                options={students}
                required
              />

              <SubmitFormButton />
            </div>
          ) : (
            <div className="flex-1">{session.student.fullName}</div>
          )}
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Has report?</div>
          <div className="flex-1">
            <Xmark className="h-6 w-6 text-error" />
          </div>
          <Link
            to={`/admin/sessions/${session.id}/mentors/${session.user.id}/write-report?back_url=${location.pathname}?${selectedMentorId ? `fixedMentorId=${selectedMentorId}` : `fixedStudentId=${selectedStudentId}`}`}
            className="btn btn-success gap-2"
          >
            <EditPencil /> Write report on behalf
          </Link>
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
