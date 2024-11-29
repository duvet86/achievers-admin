import type { LoaderFunctionArgs } from "react-router";

import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
  useSubmit,
} from "react-router";

import { useRef } from "react";
import { Eye } from "iconoir-react";
import dayjs from "dayjs";

import {
  getLoggedUserInfoAsync,
  getPermissionsAbility,
} from "~/services/.server";
import { getPaginationRange } from "~/services";
import { Pagination, Title } from "~/components";

import {
  getCountAsync,
  getStudentSessionsAsync,
  getChaptersAsync,
  getAvailabelMentorsAsync,
  getAvailabelStudentsAsync,
} from "./services.server";
import FormInputs from "./components/FormInputs";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const ability = getPermissionsAbility(loggedUser.roles);

  const url = new URL(request.url);

  const searchTermSubmit = url.searchParams.get("searchBtn");
  const clearSearchSubmit = url.searchParams.get("clearSearchBtn");
  const previousPageSubmit = url.searchParams.get("previousBtn");
  const pageNumberSubmit = url.searchParams.get("pageNumberBtn");
  const nextPageSubmit = url.searchParams.get("nextBtn");

  const chapterIdUrl = url.searchParams.get("chapterId");
  const mentorIdUrl = url.searchParams.get("mentorId");
  const studentIdUrl = url.searchParams.get("studentId");

  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const isSignedOff = url.searchParams.get("isSignedOff") === "on";

  const pageNumber = Number(url.searchParams.get("pageNumber")!);

  let chapterId: number;
  let startDateConverted: Date | undefined;
  let endDateConverted: Date | undefined;
  let mentorId: number | undefined;
  let studentId: number | undefined;

  const chapters = await getChaptersAsync(ability);

  if (clearSearchSubmit !== null || startDate?.trim() === "") {
    startDateConverted = undefined;
  } else if (startDate) {
    startDateConverted = dayjs(startDate, "YYYY/MM/DD").toDate();
  }
  if (clearSearchSubmit !== null || endDate?.trim() === "") {
    endDateConverted = undefined;
  } else if (endDate) {
    endDateConverted = dayjs(endDate, "YYYY/MM/DD").toDate();
  }
  if (clearSearchSubmit !== null || chapterIdUrl === "") {
    chapterId = chapters[0].id;
  } else {
    chapterId =
      chapters.find(({ id }) => id === Number(chapterIdUrl))?.id ??
      chapters[0].id;
  }
  if (clearSearchSubmit !== null || mentorIdUrl === "") {
    mentorId = undefined;
  } else if (mentorIdUrl) {
    mentorId = Number(mentorIdUrl);
  }
  if (clearSearchSubmit !== null || studentIdUrl === "") {
    studentId = undefined;
  } else if (studentIdUrl) {
    studentId = Number(studentIdUrl);
  }

  const count = await getCountAsync(
    chapterId,
    mentorId,
    studentId,
    startDateConverted,
    endDateConverted,
    isSignedOff,
  );

  const totalPageCount = Math.ceil(count / 10);

  let currentPageNumber = 0;
  if (searchTermSubmit !== null) {
    currentPageNumber = 0;
  } else if (clearSearchSubmit !== null) {
    currentPageNumber = 0;
  } else if (previousPageSubmit !== null && pageNumber > 0) {
    currentPageNumber = pageNumber - 1;
  } else if (nextPageSubmit !== null && pageNumber < totalPageCount) {
    currentPageNumber = pageNumber + 1;
  } else if (pageNumberSubmit !== null) {
    currentPageNumber = Number(pageNumberSubmit);
  }

  const studentSessions = await getStudentSessionsAsync(
    chapterId,
    mentorId,
    studentId,
    startDateConverted,
    endDateConverted,
    isSignedOff,
    currentPageNumber,
  );

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  const [mentors, students] = await Promise.all([
    getAvailabelMentorsAsync(ability, chapterId, studentId),
    getAvailabelStudentsAsync(ability, chapterId, mentorId),
  ]);

  return {
    mentors,
    students,
    selectedChapterId: chapterId.toString(),
    selectedMentorId: mentorId?.toString(),
    selectedStudentId: studentId?.toString(),
    chapters,
    range,
    currentPageNumber,
    count,
    studentSessions,
  };
}

export default function Index() {
  const {
    mentors,
    students,
    selectedChapterId,
    selectedMentorId,
    selectedStudentId,
    chapters,
    studentSessions,
    count,
    currentPageNumber,
    range,
  } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const submit = useSubmit();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement | null>(null);

  const totalPageCount = Math.ceil(count / 10);

  const onFormClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    formRef.current!.reset();
    void submit(formRef.current);
  };

  const handleRowClick = (id: number, completedOn: Date | null) => () => {
    const url = completedOn
      ? `/admin/student-sessions/${id}/report?${searchParams.toString()}`
      : `/admin/student-sessions/${id}?${searchParams.toString()}`;

    void navigate(url);
  };

  return (
    <>
      <Title>Reports</Title>

      <hr className="my-4" />

      <Form ref={formRef}>
        <FormInputs
          selectedChapterId={selectedChapterId}
          selectedMentorId={selectedMentorId}
          selectedStudentId={selectedStudentId}
          chapters={chapters}
          mentors={mentors}
          students={students}
          submit={submit}
          onFormClear={onFormClear}
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
                ({ id, student, completedOn, signedOffOn, session }) => (
                  <tr
                    key={id}
                    className="cursor-pointer hover:bg-base-200"
                    onClick={handleRowClick(id, completedOn)}
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
                        to={
                          completedOn
                            ? `/admin/student-sessions/${id}/report?${searchParams.toString()}`
                            : `/admin/student-sessions/${id}?${searchParams.toString()}`
                        }
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
