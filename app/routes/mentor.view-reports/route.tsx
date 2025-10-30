import type { Route } from "./+types/route";

import { Form, useSearchParams, useSubmit } from "react-router";
import { Eye } from "iconoir-react";
import dayjs from "dayjs";
import classNames from "classnames";

import {
  getCurrentTermForDate,
  getDistinctTermYears,
  getPaginationRange,
  getSelectedTerm,
  URLSafeSearch,
  useStateNavigation,
} from "~/services";
import {
  getLoggedUserInfoAsync,
  getSchoolTermsAsync,
} from "~/services/.server";
import { Pagination, StateLink, Title } from "~/components";

import {
  getCountAsync,
  getMentorsAsync,
  getSessionsAsync,
  getStudentsAsync,
  getUserAsync,
} from "./services.server";
import { FormInputs } from "./components";

export async function loader({ request }: Route.LoaderArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const { id: loggedUserId, chapterId } = await getUserAsync(loggedUser.oid);

  const CURRENT_YEAR = dayjs().year();

  const url = new URLSafeSearch(request.url);

  const previousPageSubmit = url.safeSearchParams.getNullOrEmpty("previousBtn");
  const pageNumberSubmit = url.safeSearchParams.getNullOrEmpty("pageNumberBtn");
  const nextPageSubmit = url.safeSearchParams.getNullOrEmpty("nextBtn");

  const studentId = url.safeSearchParams.getNullOrEmpty("studentId");
  const mentorId = url.safeSearchParams.getNullOrEmpty("mentorId");

  const selectedTermYear =
    url.safeSearchParams.getNullOrEmpty("selectedTermYear") ??
    CURRENT_YEAR.toString();
  const selectedTermId = url.safeSearchParams.getNullOrEmpty("selectedTermId");

  const terms = await getSchoolTermsAsync();

  const distinctTermYears = getDistinctTermYears(terms);

  const { selectedTerm, termsForYear } = getSelectedTerm(
    terms,
    selectedTermYear,
    selectedTermId,
    null,
  );

  const selectedMentorId = mentorId ? Number(mentorId) : undefined;
  const selectedStudentId = studentId ? Number(studentId) : undefined;

  const pageNumber = url.safeSearchParams.getNullOrEmpty("pageNumber")
    ? Number(url.safeSearchParams.getNullOrEmpty("pageNumber"))
    : 0;

  const students = await getStudentsAsync(
    chapterId,
    loggedUserId,
    selectedMentorId,
  );

  const mentors = await getMentorsAsync(
    chapterId,
    loggedUserId,
    selectedStudentId,
  );

  const count = await getCountAsync(
    chapterId,
    selectedTerm,
    selectedStudentId,
    selectedMentorId,
  );

  const totalPageCount = Math.ceil(count / 10);

  let currentPageNumber = 0;
  if (previousPageSubmit !== null && pageNumber > 0) {
    currentPageNumber = pageNumber - 1;
  } else if (nextPageSubmit !== null && pageNumber < totalPageCount) {
    currentPageNumber = pageNumber + 1;
  } else if (pageNumberSubmit !== null) {
    currentPageNumber = Number(pageNumberSubmit);
  }

  const sessions = await getSessionsAsync(
    chapterId,
    selectedTerm,
    selectedStudentId,
    selectedMentorId,
    currentPageNumber,
  );

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  const currentTerm = getCurrentTermForDate(terms, new Date());

  return {
    loggedUserId,
    studentOptions: students.map(({ id, fullName }) => ({
      label: fullName,
      value: id.toString(),
    })),
    mentorOptions: mentors.map(({ id, fullName }) => ({
      label: fullName,
      value: id.toString(),
    })),
    selectedStudentId: selectedStudentId?.toString(),
    selectedMentorId: selectedMentorId?.toString(),
    range,
    currentPageNumber,
    count,
    sessions,
    selectedTermYear,
    selectedTermId: selectedTerm.id.toString(),
    termYearsOptions: distinctTermYears.map((year) => ({
      value: year.toString(),
      label: year.toString(),
    })),
    termsOptions: termsForYear.map(({ id, start, end, label }) => ({
      value: id.toString(),
      label: `${label} (${start.format("D MMMM")} - ${end.format("D MMMM")}) ${currentTerm.id === id ? " (Current)" : ""}`,
    })),
  };
}

export default function Index({
  loaderData: {
    loggedUserId,
    studentOptions,
    mentorOptions,
    selectedStudentId,
    selectedMentorId,
    sessions,
    count,
    currentPageNumber,
    range,
    selectedTermYear,
    selectedTermId,
    termYearsOptions,
    termsOptions,
  },
}: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const submit = useSubmit();
  const stateNavigate = useStateNavigation();

  const totalPageCount = Math.ceil(count / 10);

  const onFormClear = () => {
    searchParams.set("studentId", "");
    searchParams.set("mentorId", "");

    void submit(Object.fromEntries(searchParams));
  };

  const onStudentChange = (studentId: string) => {
    searchParams.set("studentId", studentId);

    void submit(Object.fromEntries(searchParams));
  };

  const onMentorIdChange = (mentorId: string) => {
    searchParams.set("mentorId", mentorId);

    void submit(Object.fromEntries(searchParams));
  };

  const onTermYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    searchParams.set("selectedTermYear", event.target.value);
    searchParams.set("selectedTermId", "");

    void submit(Object.fromEntries(searchParams));
  };

  const onTermIdChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    searchParams.set("selectedTermId", event.target.value);

    void submit(Object.fromEntries(searchParams));
  };

  const navigateToReport = (id: number) => () => {
    void stateNavigate(`/mentor/view-reports/${id}`);
  };

  return (
    <>
      <Title>Reports</Title>

      <hr className="my-4" />

      <Form>
        <FormInputs
          key={`${selectedStudentId}-${selectedMentorId}`}
          selectedStudentId={selectedStudentId}
          selectedMentorId={selectedMentorId}
          studentOptions={studentOptions}
          mentorOptions={mentorOptions}
          onFormClear={onFormClear}
          onStudentChange={onStudentChange}
          onMentorIdChange={onMentorIdChange}
          selectedTermYear={selectedTermYear}
          selectedTermId={selectedTermId}
          termYearsOptions={termYearsOptions}
          termsOptions={termsOptions}
          onTermYearChange={onTermYearChange}
          onTermIdChange={onTermIdChange}
        />

        <div className="overflow-auto bg-white">
          <table className="table-lg sm:table-md table">
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
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={6}>No sessions available</td>
                </tr>
              )}
              {sessions.map(
                ({
                  id,
                  completedOn,
                  signedOffOn,
                  attendedOn,
                  isCancelled,
                  mentorSession,
                  studentSession,
                }) => (
                  <tr
                    key={id}
                    className={classNames("hover:bg-base-200 cursor-pointer", {
                      "text-error": isCancelled,
                    })}
                    onClick={navigateToReport(id)}
                  >
                    <td className="p-2">
                      {mentorSession.mentor.fullName}{" "}
                      {mentorSession.mentor.id === loggedUserId ? "(Me)" : ""}
                    </td>
                    <td className="p-2">
                      {studentSession.student.fullName}{" "}
                      {isCancelled ? "(ABSENT)" : ""}
                    </td>
                    <td className="p-2">
                      {dayjs(attendedOn).format("MMMM D, YYYY")}
                    </td>
                    <td className="hidden p-2 sm:table-cell">
                      {completedOn
                        ? dayjs(completedOn).format("MMMM D, YYYY")
                        : "-"}
                    </td>
                    <td className="hidden p-2 sm:table-cell">
                      {signedOffOn
                        ? dayjs(signedOffOn).format("MMMM D, YYYY")
                        : "-"}
                    </td>
                    <td className="hidden p-2 sm:table-cell" align="right">
                      <StateLink
                        to={`/mentor/view-reports/${id}`}
                        className="btn-xs sm:btn-md btn btn-success h-9 gap-2 sm:w-36"
                      >
                        <Eye className="hidden h-4 w-4 lg:block" />
                        View report
                      </StateLink>
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
