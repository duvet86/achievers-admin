/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import type { LoaderFunctionArgs } from "react-router";
import type { Term } from "~/models";

import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "react-router";

import { Eye } from "iconoir-react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

import {
  getLoggedUserInfoAsync,
  getPermissionsAbility,
  getSchoolTermsAsync,
} from "~/services/.server";
import {
  getCurrentTermForDate,
  getDatesForTerm,
  getPaginationRange,
} from "~/services";
import { Pagination, Title } from "~/components";

import {
  getCountAsync,
  getStudentSessionsAsync,
  getChaptersAsync,
  getAvailabelMentorsAsync,
  getAvailabelStudentsAsync,
} from "./services.server";
import FormInputs from "./components/FormInputs";

dayjs.extend(isBetween);

export async function loader({ request }: LoaderFunctionArgs) {
  const CURRENT_YEAR = dayjs().year();

  const loggedUser = await getLoggedUserInfoAsync(request);
  const ability = getPermissionsAbility(loggedUser.roles);

  const url = new URL(request.url);

  const previousPageSubmit = url.searchParams.get("previousBtn");
  const pageNumberSubmit = url.searchParams.get("pageNumberBtn");
  const nextPageSubmit = url.searchParams.get("nextBtn");

  const chapterId = url.searchParams.get("chapterId");
  const mentorId = url.searchParams.get("mentorId");
  const studentId = url.searchParams.get("studentId");

  const selectedTermYear =
    url.searchParams.get("selectedTermYear") || CURRENT_YEAR.toString();
  const selectedTermId = url.searchParams.get("selectedTermId");
  const selectedTermDate =
    url.searchParams.get("selectedTermDate") || undefined;

  const isSignedOff = url.searchParams.get("isSignedOff");

  const pageNumber = Number(url.searchParams.get("pageNumber")!);

  const [chapters, terms] = await Promise.all([
    getChaptersAsync(ability),
    getSchoolTermsAsync(),
  ]);

  let selectedTerm: Term;
  let termsForYear: Term[];

  if (!selectedTermId && selectedTermDate) {
    const termYear = dayjs(selectedTermDate).year();

    termsForYear = terms.filter(({ year }) => year === termYear);

    selectedTerm = termsForYear.find(({ start, end }) =>
      dayjs(selectedTermDate).isBetween(start, end),
    )!;
  } else {
    termsForYear = terms.filter(
      ({ year }) => year.toString() === selectedTermYear,
    );

    selectedTerm = termsForYear.find(
      (t) => t.id.toString() === selectedTermId,
    )!;

    if (selectedTerm === undefined) {
      if (selectedTermYear === CURRENT_YEAR.toString()) {
        selectedTerm = getCurrentTermForDate(terms, new Date());
      } else {
        selectedTerm = termsForYear[0];
      }
    }
  }

  const sessionDates = getDatesForTerm(selectedTerm.start, selectedTerm.end);

  const selectedChapterId = chapterId ? Number(chapterId) : chapters[0].id;
  const selectedMentorId = mentorId ? Number(mentorId) : undefined;
  const selectedStudentId = studentId ? Number(studentId) : undefined;
  const selectedIsSignedOff = isSignedOff ? isSignedOff === "on" : false;

  const count = await getCountAsync(
    selectedChapterId,
    selectedTerm,
    selectedTermDate,
    selectedMentorId,
    selectedStudentId,
    selectedIsSignedOff,
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

  const studentSessions = await getStudentSessionsAsync(
    selectedChapterId,
    selectedTerm,
    selectedTermDate,
    selectedMentorId,
    selectedStudentId,
    selectedIsSignedOff,
    currentPageNumber,
  );

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  const [mentors, students] = await Promise.all([
    getAvailabelMentorsAsync(ability, selectedChapterId, selectedStudentId),
    getAvailabelStudentsAsync(ability, selectedChapterId, selectedMentorId),
  ]);

  return {
    chaptersOptions: chapters.map(({ id, name }) => ({
      label: name,
      value: id.toString(),
    })),
    mentorsOptions: mentors.map(({ id, fullName }) => ({
      label: fullName,
      value: id.toString(),
    })),
    studentsOptions: students.map(({ id, fullName }) => ({
      label: fullName,
      value: id.toString(),
    })),
    selectedChapterId: selectedChapterId.toString(),
    selectedMentorId: selectedMentorId?.toString(),
    selectedStudentId: selectedStudentId?.toString(),
    selectedIsSignedOff,
    selectedTermYear,
    selectedTermId: selectedTerm.id.toString(),
    selectedTermDate: selectedTermDate ?? undefined,
    termYearsOptions: Array.from(new Set(terms.map(({ year }) => year))).map(
      (year) => ({
        value: year.toString(),
        label: year.toString(),
      }),
    ),
    termsOptions: termsForYear.map(({ id, name }) => ({
      value: id.toString(),
      label: name,
    })),
    sessionDatesOptions: [
      {
        value: "",
        label: "All",
      },
    ].concat(
      sessionDates.map((date) => ({
        value: dayjs(date).toISOString(),
        label: dayjs(date).format("DD/MM/YYYY"),
      })),
    ),
    range,
    currentPageNumber,
    count,
    studentSessions,
  };
}

export default function Index() {
  const {
    chaptersOptions,
    mentorsOptions,
    studentsOptions,
    termYearsOptions,
    termsOptions,
    sessionDatesOptions,
    selectedChapterId,
    selectedMentorId,
    selectedStudentId,
    selectedIsSignedOff,
    selectedTermYear,
    selectedTermId,
    selectedTermDate,
    studentSessions,
    count,
    currentPageNumber,
    range,
  } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const totalPageCount = Math.ceil(count / 10);

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

      <Form method="GET">
        <FormInputs
          chapterId={selectedChapterId}
          selectedTermId={selectedTermId}
          selectedTermYear={selectedTermYear}
          selectedTermDate={selectedTermDate}
          mentorId={selectedMentorId}
          studentId={selectedStudentId}
          isSignedOff={selectedIsSignedOff}
          chaptersOptions={chaptersOptions}
          mentorsOptions={mentorsOptions}
          studentsOptions={studentsOptions}
          termYearsOptions={termYearsOptions}
          termsOptions={termsOptions}
          sessionDatesOptions={sessionDatesOptions}
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
              {studentSessions.length === 0 && (
                <tr>
                  <td colSpan={6}>No sessions available</td>
                </tr>
              )}
              {studentSessions.map(
                ({ id, student, completedOn, signedOffOn, session }) => (
                  <tr
                    key={id}
                    className="hover:bg-base-200 cursor-pointer"
                    onClick={handleRowClick(id, completedOn)}
                  >
                    <td className="p-2">{session.mentor.fullName}</td>
                    <td className="p-2">{student.fullName}</td>
                    <td className="p-2">
                      {dayjs(session.attendedOn).format("MMMM D, YYYY")}
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
