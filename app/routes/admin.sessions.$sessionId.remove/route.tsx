import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useLocation,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import {
  Check,
  EditPencil,
  InfoCircle,
  StatsReport,
  Trash,
  Xmark,
} from "iconoir-react";

import { Title } from "~/components";

import {
  getChapterByIdAsync,
  getSessionByIdAsync,
  removeSessionAsync,
} from "./services.server";

import { Fragment } from "react/jsx-runtime";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.sessionId, "chapterId not found");

  const session = await getSessionByIdAsync(Number(params.sessionId));
  const chapter = await getChapterByIdAsync(session.chapterId);

  return {
    chapter,
    session,
    attendedOnLabel: dayjs(session.attendedOn).format("MMMM D, YYYY"),
  };
}

export async function action({ params, request }: ActionFunctionArgs) {
  invariant(params.sessionId, "sessionId not found");

  const formData = await request.formData();
  const selectedStudentId = formData.get("studentId");

  const url = new URL(request.url);

  const session = await removeSessionAsync({
    sessionId: Number(params.sessionId),
    studentId: selectedStudentId !== null ? Number(selectedStudentId) : null,
  });

  return redirect(
    `/admin/chapters/${session.chapterId}/roster-mentors/${session.mentorId}/attended-on/${dayjs(session.attendedOn).format("YYYY-MM-DD")}/new?${url.searchParams}`,
  );
}

export default function Index() {
  const { attendedOnLabel, chapter, session } = useLoaderData<typeof loader>();
  const lcation = useLocation();
  const [searchParams] = useSearchParams();
  const submit = useSubmit();

  const backURL = searchParams.get("back_url");

  const handleFormSubmit = (studentId: number | null) => () => {
    if (!confirm(`Are you sure?`)) {
      return;
    }

    const formData = new FormData();

    if (studentId !== null) {
      formData.append("studentId", studentId.toString());
    }

    submit(formData, {
      method: "DELETE",
    });
  };

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
        <div className="flex items-center justify-between gap-2 border-b p-2">
          <div className="w-72 font-bold">Chapter</div>
          <div className="flex-1">{chapter.name}</div>
        </div>

        <div className="flex items-center justify-between gap-2 border-b p-2">
          <div className="font-bold sm:w-72">Session</div>
          <div className="sm:flex-1">{attendedOnLabel}</div>
        </div>

        <div className="flex items-center justify-between gap-2 border-b p-2">
          <div className="font-bold sm:w-72">Mentor</div>
          <div className="sm:flex-1">{session.mentor.fullName}</div>
        </div>

        {session.studentSession.length === 0 && (
          <div className="flex items-center gap-4">
            <p className="alert alert-info">
              <InfoCircle />
              Mentor is marked as available for this session
            </p>

            <button
              className="btn btn-error w-full sm:w-48"
              type="button"
              onClick={handleFormSubmit(null)}
            >
              <Trash />
              Cancel
            </button>
          </div>
        )}

        {session.studentSession.map(
          ({ id, student, completedOn, hasReport, signedOffOn }) => (
            <Fragment key={id}>
              <div className="flex flex-col gap-2 border-b p-2 sm:flex-row sm:items-center">
                <div className="w-72 font-bold">Student</div>
                <div className="flex flex-1 flex-col items-end gap-4 sm:flex-row">
                  <p className="flex-1">{student.fullName}</p>

                  <button
                    className="btn btn-error w-full sm:w-48"
                    type="button"
                    onClick={handleFormSubmit(student.id)}
                  >
                    <Trash />
                    Cancel
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-b p-2">
                <div className="font-bold sm:w-72">Has report?</div>
                <div className="sm:flex-1">
                  {hasReport ? (
                    <Check className="text-success" />
                  ) : (
                    <Xmark className="text-error" />
                  )}
                </div>
                {hasReport && (
                  <Link
                    to={`report?${searchParams.toString()}`}
                    className="btn btn-success w-full sm:w-48"
                  >
                    <StatsReport /> Go to report
                  </Link>
                )}
                {!hasReport && session.mentor.id && (
                  <Link
                    to={`/admin/student-sessions/${id}/mentors/${session.mentor.id}/write-report?back_url=${encodeURIComponent(lcation.pathname + location.search)}`}
                    className="btn btn-success w-full sm:w-48"
                  >
                    <EditPencil /> Report on behalf
                  </Link>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-b p-2">
                <div className="font-bold sm:w-72">Is report completed?</div>
                <div className="sm:flex-1">
                  {completedOn ? (
                    <Check className="text-success" />
                  ) : (
                    <Xmark className="text-error" />
                  )}
                </div>
                {completedOn && dayjs(completedOn).format("MMMM D, YYYY")}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-b p-2">
                <div className="font-bold sm:w-72">Is report signed off?</div>
                <div className="sm:flex-1">
                  {signedOffOn ? (
                    <Check className="text-success" />
                  ) : (
                    <Xmark className="text-error" />
                  )}
                </div>
                {signedOffOn && dayjs(signedOffOn).format("MMMM D, YYYY")}
              </div>
            </Fragment>
          ),
        )}
      </div>
    </>
  );
}
