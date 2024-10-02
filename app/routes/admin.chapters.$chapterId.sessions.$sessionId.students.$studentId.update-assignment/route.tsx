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
import { EditPencil, Xmark } from "iconoir-react";

import { Title } from "~/components";

import {
  updateSessionAsync,
  getChapterByIdAsync,
  getMentorsForStudentAsync,
  getSessionsByDateAsync,
  getSessionByIdAsync,
  removeSessionAsync,
} from "./services.server";

import { ManageSession } from "./components/ManageSession";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.sessionId, "sessionId not found");
  invariant(params.studentId, "studentId not found");

  const studentId = Number(params.studentId);

  const session = await getSessionByIdAsync(Number(params.sessionId));

  if (session.isCancelled || session.completedOn) {
    const url = new URL(request.url);
    const backURL = url.searchParams.get("back_url");

    return redirect(`/admin/sessions/${session.id}?back_url=${backURL}`);
  }

  const [chapter, sessionsForDate] = await Promise.all([
    getChapterByIdAsync(Number(params.chapterId)),
    getSessionsByDateAsync(Number(params.chapterId), session.attendedOn),
  ]);

  const mentors = await getMentorsForStudentAsync(
    Number(params.chapterId),
    studentId,
  );

  const mentorsInSession = sessionsForDate.map(({ userId }) => userId);
  const selectedMentorId = session.user.id;

  return json({
    chapter,
    session,
    selectedMentorId: selectedMentorId.toString(),
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

export async function action({ params, request }: ActionFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.sessionId, "sessionId not found");
  invariant(params.studentId, "studentId not found");

  const formData = await request.formData();
  const selectedMentorId = formData.get("mentorId");
  const action = formData.get("action");

  if (action === "save") {
    await updateSessionAsync({
      sessionId: Number(params.sessionId),
      mentorId: Number(selectedMentorId),
      studentId: Number(params.studentId),
    });
  } else if (action === "remove") {
    await removeSessionAsync(Number(params.sessionId));
  }

  const url = new URL(request.url);
  const backURL = url.searchParams.get("back_url");
  if (backURL) {
    return redirect(backURL);
  }

  return redirect(`/admin/chapters/${params.chapterId}/roster-students`);
}

export default function Index() {
  const { attendedOnLabel, chapter, session, mentors, selectedMentorId } =
    useLoaderData<typeof loader>();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const backURL = searchParams.get("back_url");

  return (
    <>
      <div className="flex justify-between">
        <Title
          to={backURL ? backURL : `/admin/sessions?${searchParams.toString()}`}
        >
          Session of &quot;
          {attendedOnLabel}&quot;
        </Title>

        {!session.isCancelled && !session.completedOn && (
          <Link
            to={`/admin/sessions/${session.id}/cancel?${searchParams.toString()}`}
            className="btn btn-error w-48 gap-2"
          >
            <Xmark className="h-6 w-6" /> Cancel session
          </Link>
        )}
      </div>

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
          <ManageSession
            name="mentorId"
            defaultValue={selectedMentorId}
            placeholder="Select a mentor"
            options={mentors}
          />
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Student</div>
          <div className="flex-1">{session.student?.fullName}</div>
        </div>

        <div className="flex items-center gap-2 border-b p-2">
          <div className="w-72 font-bold">Has report?</div>
          <div className="flex-1">
            <Xmark className="h-6 w-6 text-error" />
          </div>
          <Link
            to={`/admin/sessions/${session.id}/mentors/${session.user.id}/write-report?back_url=${location.pathname}`}
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
