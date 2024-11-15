import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import {
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
  const addStudent = formData.get("addStudent");
  const selectedStudentId = formData.get("studentId");

  const url = new URL(request.url);

  if (addStudent !== null) {
    const studentSession = await addStudentToSessionAsync(
      Number(params.sessionId),
      Number(selectedStudentId),
    );

    return redirect(
      `/admin/chapters/${studentSession.session.chapterId}/roster-mentors`,
    );
  }

  const session = await removeSessionAsync({
    sessionId: Number(params.sessionId),
    studentId: selectedStudentId !== null ? Number(selectedStudentId) : null,
  });

  return redirect(
    `/admin/chapters/${session.chapterId}/roster-mentors/${session.mentorId}/attended-on/${dayjs(session.attendedOn).format("YYYY-MM-DD")}/new?${url.searchParams}`,
  );
}

export default function Index() {
  const { attendedOnLabel, chapter, session, students } =
    useLoaderData<typeof loader>();
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

      <div className="my-8 flex flex-col gap-6">
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
            name="addStudent"
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
                    <td className="border p-2">{student.fullName}</td>
                    <td className="border">
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
                    <td className="border p-2">
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
                    <td className="border p-2" align="right">
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
                          onClick={handleFormSubmit(student.id)}
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
      </div>
    </>
  );
}
