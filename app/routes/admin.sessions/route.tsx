import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";

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
  getSessionsAsync,
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
  const isCompleted = url.searchParams.get("isCompleted") === "on";
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
    isCompleted,
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

  const sessions = await getSessionsAsync(
    chapterId,
    mentorId,
    studentId,
    startDateConverted,
    endDateConverted,
    isCompleted,
    isSignedOff,
    currentPageNumber,
  );

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  const [mentors, students] = await Promise.all([
    getAvailabelMentorsAsync(ability, chapterId, studentId),
    getAvailabelStudentsAsync(ability, chapterId, mentorId),
  ]);

  return json({
    mentors,
    students,
    selectedChapterId: chapterId.toString(),
    selectedMentorId: mentorId?.toString(),
    selectedStudentId: studentId?.toString(),
    chapters,
    range,
    currentPageNumber,
    count,
    sessions,
  });
}

export default function Index() {
  const {
    mentors,
    students,
    selectedChapterId,
    selectedMentorId,
    selectedStudentId,
    chapters,
    sessions,
    count,
    currentPageNumber,
    range,
  } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement | null>(null);

  const totalPageCount = Math.ceil(count / 10);

  const onFormClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    formRef.current!.reset();
    submit(formRef.current);
  };

  return (
    <>
      <Title>Sessions</Title>

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
          <table className="table table-zebra">
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
                <th align="right" className="p-2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={6}>No sessions available</td>
                </tr>
              )}
              {sessions.map(
                (
                  { id, attendedOn, completedOn, signedOffOn, student, user },
                  index,
                ) => (
                  <tr key={index}>
                    <td className="border p-2">{user.fullName}</td>
                    <td className="border p-2">{student?.fullName}</td>
                    <td className="border p-2">
                      {dayjs(attendedOn).format("MMMM D, YYYY")}
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
                    <td className="border p-2" align="right">
                      <Link
                        to={
                          completedOn
                            ? `/admin/sessions/${id}/report?${searchParams.toString()}`
                            : `/admin/sessions/${id}?${searchParams.toString()}`
                        }
                        className="btn btn-success btn-xs w-20"
                      >
                        <Eye className="hidden h-4 w-4 sm:block" />
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
