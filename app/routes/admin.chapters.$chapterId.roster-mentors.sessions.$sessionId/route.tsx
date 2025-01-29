import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { redirect } from "react-router";
import {
  Form,
  Link,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "react-router";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import {
  BookmarkBook,
  Check,
  FloppyDiskArrowIn,
  InfoCircle,
  StatsReport,
  Trash,
  Xmark,
} from "iconoir-react";

import { SelectSearch, Title } from "~/components";

import {
  addStudentToSessionAsync,
  getChapterByIdAsync,
  getSessionByIdAsync,
  getStudentsForMentorAsync,
  removeSessionAsync,
} from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.sessionId, "sessionId not found");

  const [chapter, session] = await Promise.all([
    getChapterByIdAsync(Number(params.chapterId)),
    getSessionByIdAsync(Number(params.sessionId)),
  ]);

  const students = await getStudentsForMentorAsync(
    session.chapterId,
    session.mentor.id,
  );

  const studentIdsInSession = session.studentSession.map(
    ({ student: { id } }) => id,
  );

  return {
    chapter,
    session,
    attendedOnLabel: dayjs(session.attendedOn).format("MMMM D, YYYY"),
    students: students
      .filter(({ id }) => !studentIdsInSession.includes(id))
      .map(({ id, fullName }) => ({
        label: fullName,
        value: id.toString(),
      })),
  };
}

export async function action({ params, request }: ActionFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.sessionId, "sessionId not found");

  const formData = await request.formData();
  const action = formData.get("action");

  const url = new URL(request.url);

  switch (action) {
    case "addStudent": {
      const selectedStudentId = formData.get("studentId");

      await addStudentToSessionAsync(
        Number(params.sessionId),
        Number(selectedStudentId),
      );

      return null;
    }
    case "restore":
    case "cancelAvailable": {
      const session = await removeSessionAsync({
        sessionId: Number(params.sessionId),
        studentId: null,
      });

      return redirect(
        `/admin/chapters/${session.chapterId}/roster-mentors/${session.mentorId}/attended-on/${dayjs(session.attendedOn).format("YYYY-MM-DD")}/new?${url.searchParams}`,
      );
    }
    case "cancelStudent": {
      const selectedStudentId = formData.get("studentId");

      const session = await removeSessionAsync({
        sessionId: Number(params.sessionId),
        studentId: Number(selectedStudentId),
      });

      return redirect(
        `/admin/chapters/${session.chapterId}/roster-mentors/${session.mentorId}/attended-on/${dayjs(session.attendedOn).format("YYYY-MM-DD")}/new?${url.searchParams}`,
      );
    }
    default:
      throw new Error();
  }
}

export default function Index() {
  const { attendedOnLabel, chapter, session, students } =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const submit = useSubmit();

  const backURL = searchParams.get("back_url");

  const handleRemoveSession = () => {
    if (!confirm(`Are you sure?`)) {
      return;
    }

    const formData = new FormData();
    formData.append("action", "cancelAvailable");

    void submit(formData, {
      method: "POST",
    });
  };

  const handleStudentRemoveSession = (studentId: number) => () => {
    if (!confirm(`Are you sure?`)) {
      return;
    }

    const formData = new FormData();
    formData.append("action", "cancelStudent");
    formData.append("studentId", studentId.toString());

    void submit(formData, {
      method: "POST",
    });
  };

  const handleRestoreUnavailableSession = () => {
    if (!confirm(`Are you sure?`)) {
      return;
    }

    const formData = new FormData();
    formData.append("action", "restore");

    void submit(formData, {
      method: "POST",
    });
  };

  return (
    <>
      <Title
        to={backURL ?? `/admin/student-sessions?${searchParams.toString()}`}
      >
        Session of &quot;
        {attendedOnLabel}&quot;
      </Title>

      <div className="my-8 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">Chapter</div>
          <div className="flex-1">{chapter.name}</div>
        </div>

        <div className="flex items-center justify-between gap-2 border-b border-gray-300 p-2">
          <div className="font-bold sm:w-72">Session</div>
          <div className="sm:flex-1">{attendedOnLabel}</div>
        </div>

        <div className="flex items-center justify-between gap-2 border-b border-gray-300 p-2">
          <div className="font-bold sm:w-72">Mentor</div>
          <div className="sm:flex-1">{session.mentor.fullName}</div>
        </div>

        {session.status === "UNAVAILABLE" ? (
          <div className="flex items-center justify-between gap-4">
            <p className="alert alert-error">
              <InfoCircle />
              Mentor is marked as unavailable for this session
            </p>

            <button
              className="btn btn-secondary w-full sm:w-48"
              type="button"
              onClick={handleRestoreUnavailableSession}
            >
              <BookmarkBook />
              Restore
            </button>
          </div>
        ) : (
          session.studentSession.length === 0 && (
            <div className="flex items-center gap-4">
              <p className="alert alert-info">
                <InfoCircle />
                Mentor is marked as available for this session
              </p>

              <button
                className="btn btn-error w-full sm:w-48"
                type="button"
                onClick={handleRemoveSession}
              >
                <Trash />
                Cancel
              </button>
            </div>
          )
        )}

        {session.status !== "UNAVAILABLE" && (
          <>
            <Form method="POST" className="flex w-full items-end gap-4">
              <SelectSearch
                key={session.studentSession.length}
                name="studentId"
                placeholder="Select a student"
                options={students}
                required
                showClearButton
              />

              <button
                className="btn btn-primary w-48 gap-2"
                type="submit"
                name="action"
                value="addStudent"
              >
                <FloppyDiskArrowIn />
                Book
              </button>
            </Form>

            <div className="overflow-auto bg-white">
              <table className="table">
                <thead>
                  <tr>
                    <th align="left" className="p-2">
                      Student
                    </th>
                    <th align="left" className="p-2">
                      Completed On
                    </th>
                    <th align="left" className="p-2">
                      Signed Off On
                    </th>
                    <th align="right" className="p-2">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {session.studentSession.map(
                    ({ id, student, completedOn, signedOffOn }) => (
                      <tr key={id}>
                        <td className="p-2">{student.fullName}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            {completedOn ? (
                              <Check className="text-success" />
                            ) : (
                              <Xmark className="text-error" />
                            )}
                            <span>
                              {completedOn &&
                                dayjs(completedOn).format("MMMM D, YYYY")}
                            </span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            {signedOffOn ? (
                              <Check className="text-success" />
                            ) : (
                              <Xmark className="text-error" />
                            )}
                            <span>
                              {signedOffOn &&
                                dayjs(signedOffOn).format("MMMM D, YYYY")}
                            </span>
                          </div>
                        </td>
                        <td className="p-2" align="right">
                          {completedOn ? (
                            <Link
                              to={`report?${searchParams.toString()}`}
                              className="btn btn-success btn-sm"
                            >
                              <StatsReport /> Go to report
                            </Link>
                          ) : (
                            <button
                              className="btn btn-error btn-sm"
                              type="button"
                              onClick={handleStudentRemoveSession(student.id)}
                            >
                              <Trash />
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
