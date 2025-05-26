/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import type { Term } from "~/models";
import type { Route } from "./+types/route";

import { Form, useSearchParams } from "react-router";

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
import { Pagination, StateLink, Title } from "~/components";

import {
  getCountAsync,
  getSessionsAsync,
  getChaptersAsync,
  getAvailabelMentorsAsync,
  getAvailabelStudentsAsync,
} from "./services.server";
import FormInputs from "./components/FormInputs";

dayjs.extend(isBetween);

export async function loader({ request }: Route.LoaderArgs) {
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

  const filterReports = url.searchParams.get("filterReports");

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
  const selectedFilterReports = filterReports ?? "TO_SIGN_OFF";

  const count = await getCountAsync(
    selectedChapterId,
    selectedTerm,
    selectedTermDate,
    selectedMentorId,
    selectedStudentId,
    selectedFilterReports,
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
    selectedChapterId,
    selectedTerm,
    selectedTermDate,
    selectedMentorId,
    selectedStudentId,
    selectedFilterReports,
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
    selectedFilterReports,
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
    sessions,
  };
}

export default function Index({
  loaderData: {
    chaptersOptions,
    mentorsOptions,
    studentsOptions,
    termYearsOptions,
    termsOptions,
    sessionDatesOptions,
    selectedChapterId,
    selectedMentorId,
    selectedStudentId,
    selectedFilterReports,
    selectedTermYear,
    selectedTermId,
    selectedTermDate,
    sessions,
    count,
    currentPageNumber,
    range,
  },
}: Route.ComponentProps) {
  const [searchParams] = useSearchParams();

  const totalPageCount = Math.ceil(count / 10);

  return (
    <>
      <Title>Reports</Title>

      <hr className="my-4" />

      <Form method="GET">
        <FormInputs
          key={`${selectedChapterId}-${selectedTermId}-${selectedTermDate}-${selectedMentorId}-${selectedStudentId}`}
          selectedChapterId={selectedChapterId}
          selectedTermId={selectedTermId}
          selectedTermYear={selectedTermYear}
          selectedTermDate={selectedTermDate}
          mentorId={selectedMentorId}
          studentId={selectedStudentId}
          filterReports={selectedFilterReports}
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
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={6}>No reports available</td>
                </tr>
              )}
              {sessions.map(
                ({
                  id,
                  attendedOn,
                  completedOn,
                  signedOffOn,
                  studentSession,
                  mentorSession,
                }) => (
                  <tr key={id} className="hover:bg-base-200">
                    <td className="p-2">{mentorSession.mentor.fullName}</td>
                    <td className="p-2">{studentSession.student.fullName}</td>
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
                      {completedOn ? (
                        <StateLink
                          to={`/admin/sessions/${id}/report?${searchParams.toString()}`}
                          className="btn btn-success btn-xs btn-block"
                        >
                          <Eye className="h-4 w-4" />
                          Report
                        </StateLink>
                      ) : (
                        <StateLink
                          to={`/admin/sessions/${id}?${searchParams.toString()}`}
                          className="btn btn-warning btn-xs btn-block"
                        >
                          <Eye className="h-4 w-4" />
                          Session
                        </StateLink>
                      )}
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
