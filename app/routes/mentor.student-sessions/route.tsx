import type { LoaderFunctionArgs } from "@remix-run/node";

import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { Eye } from "iconoir-react";
import dayjs from "dayjs";

import { getPaginationRange } from "~/services";
import { getLoggedUserInfoAsync } from "~/services/.server";
import { Pagination, Title } from "~/components";

import {
  getCountAsync,
  getMentorsAsync,
  getStudentSessionsAsync,
  getStudentsAsync,
  getUserAsync,
} from "./services.server";
import FormInputs from "./components/FormInputs";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const { id: loggedUserId, chapterId } = await getUserAsync(loggedUser.oid);

  const url = new URL(request.url);

  const previousPageSubmit = url.searchParams.get("previousBtn");
  const pageNumberSubmit = url.searchParams.get("pageNumberBtn");
  const nextPageSubmit = url.searchParams.get("nextBtn");

  const studentIdUrl = url.searchParams.get("studentId");
  const mentorIdUrl = url.searchParams.get("mentorId");

  const pageNumber = url.searchParams.get("pageNumber")
    ? Number(url.searchParams.get("pageNumber"))
    : 0;

  const students = await getStudentsAsync(chapterId, loggedUserId);

  const studentId = studentIdUrl
    ? Number(studentIdUrl)
    : (students?.[0]?.id ?? undefined);

  const mentors = await getMentorsAsync(chapterId, studentId);

  const mentorId = mentorIdUrl ? Number(mentorIdUrl) : loggedUserId;

  const count = await getCountAsync(chapterId, studentId, mentorId);

  const totalPageCount = Math.ceil(count / 10);

  let currentPageNumber = 0;
  if (previousPageSubmit !== null && pageNumber > 0) {
    currentPageNumber = pageNumber - 1;
  } else if (nextPageSubmit !== null && pageNumber < totalPageCount) {
    currentPageNumber = pageNumber + 1;
  } else if (pageNumberSubmit !== null) {
    currentPageNumber = Number(pageNumberSubmit);
  }

  const studentSessions = await getStudentSessionsAsync(
    chapterId,
    studentId,
    mentorId,
    currentPageNumber,
  );

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  return {
    students,
    mentors,
    selectedStudentId: studentId?.toString(),
    selectedMentorId: mentorId?.toString(),
    range,
    currentPageNumber,
    count,
    studentSessions,
  };
}

export default function Index() {
  const {
    students,
    mentors,
    selectedStudentId,
    selectedMentorId,
    studentSessions,
    count,
    currentPageNumber,
    range,
  } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const submit = useSubmit();
  const navigate = useNavigate();

  const totalPageCount = Math.ceil(count / 10);

  const onFormClear = () => {
    searchParams.set("studentId", "");
    searchParams.set("mentorId", "");

    submit(Object.fromEntries(searchParams));
  };

  const onStudentChange = (studentId: string) => {
    searchParams.set("studentId", studentId);

    submit(Object.fromEntries(searchParams));
  };

  const onMentorIdChange = (mentorId: string) => {
    searchParams.set("mentorId", mentorId);

    submit(Object.fromEntries(searchParams));
  };

  const handleRowClick = (id: number) => () => {
    const url = `/mentor/student-sessions/${id}?${searchParams.toString()}`;

    navigate(url);
  };

  return (
    <>
      <Title>Reports</Title>

      <hr className="my-4" />

      <Form>
        <FormInputs
          selectedStudentId={selectedStudentId}
          selectedMentorId={selectedMentorId}
          students={students}
          mentors={mentors}
          onFormClear={onFormClear}
          onStudentChange={onStudentChange}
          onMentorIdChange={onMentorIdChange}
        />

        <div className="overflow-auto bg-white">
          <table className="table table-lg sm:table-md">
            <thead>
              <tr>
                <th align="left" className="p-2">
                  Mentor
                </th>
                <th align="left" className="p-2">
                  Student
                </th>
                <th align="left" className="p-2">
                  Session of
                </th>
                <th align="left" className="hidden p-2 sm:table-cell">
                  Completed on
                </th>
                <th align="left" className="hidden p-2 sm:table-cell">
                  Signed off on
                </th>
                <th align="right" className="hidden p-2 sm:table-cell">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {studentSessions.length === 0 && (
                <tr>
                  <td colSpan={6}>No sessions available</td>
                </tr>
              )}
              {studentSessions.map(
                ({ id, completedOn, signedOffOn, student, session }) => (
                  <tr
                    key={id}
                    className="cursor-pointer hover:bg-base-200"
                    onClick={handleRowClick(id)}
                  >
                    <td className="border p-2">{session.mentor.fullName}</td>
                    <td className="border p-2">{student.fullName}</td>
                    <td className="border p-2">
                      {dayjs(session.attendedOn).format("MMMM D, YYYY")}
                    </td>
                    <td className="hidden border p-2 sm:table-cell">
                      {completedOn
                        ? dayjs(completedOn).format("MMMM D, YYYY")
                        : "-"}
                    </td>
                    <td className="hidden border p-2 sm:table-cell">
                      {signedOffOn
                        ? dayjs(signedOffOn).format("MMMM D, YYYY")
                        : "-"}
                    </td>
                    <td
                      className="hidden border p-2 sm:table-cell"
                      align="right"
                    >
                      <Link
                        to={`/mentor/student-sessions/${id}?${searchParams.toString()}`}
                        className="btn btn-success btn-xs btn-block"
                      >
                        <Eye className="h-4 w-4" />
                        Report
                      </Link>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        <input type="hidden" name="pageNumber" value={currentPageNumber} />

        <Pagination
          range={range}
          currentPageNumber={currentPageNumber}
          totalPageCount={totalPageCount}
        />
      </Form>
    </>
  );
}
