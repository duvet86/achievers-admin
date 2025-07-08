import type { Route } from "./+types/route";

import dayjs from "dayjs";
import {
  StatsReport,
  Check,
  Xmark,
  Eye,
  UserXmark,
  WarningTriangle,
  InfoCircle,
  EditPencil,
  GraduationCap,
} from "iconoir-react";
import { Form, useSubmit } from "react-router";
import classNames from "classnames";

import {
  getLoggedUserInfoAsync,
  getSchoolTermsAsync,
} from "~/services/.server";
import {
  getCurrentTermForDate,
  getDistinctTermYears,
  getPaginationRange,
  getSelectedTerm,
} from "~/services";
import { Pagination, StateLink, SubTitle } from "~/components";

import {
  getSessionsAsync,
  getSessionsCountAsync,
  getUserByAzureADIdAsync,
  sessionsStatsAsync,
  studentsMentoredAsync,
} from "./services.server";

export async function loader({ request }: Route.LoaderArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  const CURRENT_YEAR = dayjs().year();

  const url = new URL(request.url);

  const pageNumber = Number(url.searchParams.get("pageNumber")!);
  const previousPageSubmit = url.searchParams.get("previousBtn");
  const pageNumberSubmit = url.searchParams.get("pageNumberBtn");
  const nextPageSubmit = url.searchParams.get("nextBtn");

  const selectedTermYear =
    url.searchParams.get("selectedTermYear") ?? CURRENT_YEAR.toString();
  const selectedTermId = url.searchParams.get("selectedTermId");

  const terms = await getSchoolTermsAsync();

  const distinctTermYears = getDistinctTermYears(terms);

  const { selectedTerm, termsForYear } = getSelectedTerm(
    terms,
    selectedTermYear,
    selectedTermId,
    null,
  );

  const count = await getSessionsCountAsync(
    user.id,
    user.chapterId,
    selectedTerm,
  );

  const numberItems = 10;
  const totalPageCount = Math.ceil(count / numberItems);

  let currentPageNumber = 0;
  if (previousPageSubmit !== null && pageNumber > 0) {
    currentPageNumber = pageNumber - 1;
  } else if (nextPageSubmit !== null && pageNumber < totalPageCount) {
    currentPageNumber = pageNumber + 1;
  } else if (pageNumberSubmit !== null) {
    currentPageNumber = Number(pageNumberSubmit);
  }

  const [sessionStats, studentsMentored, sessions] = await Promise.all([
    sessionsStatsAsync(user.id),
    studentsMentoredAsync(user.id),
    getSessionsAsync(currentPageNumber, user.id, user.chapterId, selectedTerm),
  ]);

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  const currentTerm = getCurrentTermForDate(terms, new Date());

  return {
    sessionStats,
    studentsMentored,
    selectedTermYear,
    selectedTermId: selectedTerm.id.toString(),
    range,
    currentPageNumber,
    count,
    currentTermLabel: `${currentTerm.name} (${currentTerm.start.format("D MMMM")} - ${currentTerm.end.format("D MMMM")})`,
    user,
    sessions,
    termYearsOptions: distinctTermYears.map((year) => ({
      value: year.toString(),
      label: year.toString(),
    })),
    termsOptions: termsForYear.map(({ id, start, end, name }) => ({
      value: id.toString(),
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")}) ${currentTerm.id === id ? " (Current)" : ""}`,
    })),
  };
}

export default function Index({
  loaderData: {
    sessionStats,
    studentsMentored,
    selectedTermYear,
    selectedTermId,
    range,
    currentPageNumber,
    count,
    currentTermLabel,
    user,
    sessions,
    termYearsOptions,
    termsOptions,
  },
}: Route.ComponentProps) {
  const submit = useSubmit();

  const totalPageCount = Math.ceil(count / 10);

  const submitForm = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const formData = new FormData(event.target.form!);
    void submit(formData);
  };

  return (
    <>
      <article className="prose relative mb-4 h-24 max-w-none lg:h-28">
        <div className="bg-achievers h-16 w-full rounded-md opacity-75 lg:h-28"></div>
        <h1 className="absolute top-6 left-6 hidden lg:block">
          Welcome {user.fullName} - {currentTermLabel}
        </h1>
        <h2 className="absolute top-0 mt-0 p-4 lg:hidden">
          Welcome {user.fullName}
        </h2>
      </article>

      <div className="flex w-full flex-col justify-center gap-4">
        {user.profilePicturePath === null && (
          <div role="alert" className="alert alert-warning">
            <WarningTriangle />
            <span>
              You haven&apos;t uploaded a profile picture yet. Go to the{" "}
              <StateLink className="link" to="/mentor/profile">
                profile page
              </StateLink>{" "}
              to upload a profile picture.
            </span>
          </div>
        )}

        {sessionStats && (
          <div className="stats stats-vertical lg:stats-horizontal shado w-full">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <InfoCircle className="h-8 w-8" />
              </div>
              <div className="stat-title">Sessions attended</div>
              <div className="stat-value">{sessionStats.sessionCount}</div>
              <div className="stat-desc">
                Since {dayjs(sessionStats.minAttendedOn).format("MMMM YYYY")}
              </div>
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary">
                <EditPencil className="h-8 w-8" />
              </div>
              <div className="stat-title">Reports completed</div>
              <div className="stat-value">{sessionStats.reportCount}</div>
              <div className="stat-desc">
                out of {sessionStats.sessionCount}
              </div>
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div className="stat-title">Unique students mentored</div>
              <div className="stat-value">{studentsMentored}</div>
              <div className="stat-desc">
                Since {dayjs(sessionStats.minAttendedOn).format("MMMM YYYY")}
              </div>
            </div>
          </div>
        )}
      </div>

      <Form>
        <SubTitle>Sessions</SubTitle>

        <div key={selectedTermId}>
          <label className="fieldset-label">Term</label>
          <div className="join">
            <select
              className="select join-item basis-28"
              name="selectedTermYear"
              defaultValue={selectedTermYear}
              onChange={submitForm}
            >
              {termYearsOptions.map(({ label, value }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className="select join-item"
              name="selectedTermId"
              defaultValue={selectedTermId}
              onChange={submitForm}
            >
              {termsOptions.map(({ label, value }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div data-testid="sessions" className="overflow-auto bg-white">
          <table className="table-lg table">
            <thead>
              <tr>
                <th className="hidden w-6 lg:table-cell">#</th>
                <th align="left">Session date</th>
                <th align="left">Student</th>
                <th align="left" className="hidden lg:table-cell">
                  Report completed
                </th>
                <th align="left" className="hidden lg:table-cell">
                  Signed off
                </th>
                <th align="right">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <i>No sessions</i>
                  </td>
                </tr>
              )}
              {sessions.map(
                (
                  {
                    id,
                    attendedOn,
                    daysDiff,
                    studentSession,
                    completedOn,
                    signedOffOn,
                    isCancelled,
                  },
                  index,
                ) => (
                  <tr
                    key={id}
                    className={classNames({
                      "text-info": daysDiff > 0,
                      "text-error": isCancelled,
                    })}
                  >
                    <td className="hidden border-r lg:table-cell">
                      {index + 1}
                    </td>
                    <td align="left">
                      {daysDiff > 0
                        ? `${dayjs(attendedOn).format("MMMM D, YYYY")} (in ${daysDiff} days)`
                        : `${dayjs(attendedOn).format("MMMM D, YYYY")}`}
                    </td>
                    <td align="left">
                      {studentSession.student.fullName}{" "}
                      {isCancelled ? "(ABSENT)" : ""}
                    </td>
                    <td align="left" className="hidden lg:table-cell">
                      {completedOn ? (
                        <div
                          data-testid="completedOn"
                          className="flex items-center gap-2"
                        >
                          <Check className="text-success h-4 w-4" />
                          {dayjs(completedOn).format("MMMM D, YYYY")}
                        </div>
                      ) : (
                        <Xmark
                          data-testid="not-completedOn"
                          className="text-error h-4 w-4"
                        />
                      )}
                    </td>
                    <td align="left" className="hidden lg:table-cell">
                      {signedOffOn ? (
                        <div
                          data-testid="signedOffOn"
                          className="flex items-center gap-2"
                        >
                          <Check className="text-success h-4 w-4" />
                          {dayjs(signedOffOn).format("MMMM D, YYYY")}
                        </div>
                      ) : (
                        <Xmark
                          data-testid="not-signedOffOn"
                          className="text-error h-4 w-4"
                        />
                      )}
                    </td>
                    <td align="right">
                      {daysDiff <= 0 && (
                        <div className="flex justify-end gap-2">
                          {!isCancelled &&
                            (completedOn !== null ? (
                              <StateLink
                                to={`/mentor/view-reports/${id}`}
                                className="btn-xs sm:btn-md btn btn-success h-9 gap-2 sm:w-36"
                              >
                                <Eye className="hidden h-4 w-4 lg:block" />
                                View report
                              </StateLink>
                            ) : (
                              <StateLink
                                to={`/mentor/write-report?selectedStudentId=${studentSession.student.id}&selectedTermDate=${dayjs(attendedOn).format("YYYY-MM-DD")}T00:00:00.000Z`}
                                className="btn-xs sm:btn-md btn h-9 gap-2 sm:w-36"
                              >
                                <StatsReport className="hidden h-4 w-4 lg:block" />
                                Write report
                              </StateLink>
                            ))}

                          {completedOn === null && (
                            <StateLink
                              to={`/mentor/sessions/${id}/student-absent`}
                              className="btn btn-error hidden h-9 gap-2 sm:flex sm:w-56"
                            >
                              <UserXmark className="hidden h-4 w-4 lg:block" />
                              {isCancelled
                                ? "View reason"
                                : "Mark student absent"}
                            </StateLink>
                          )}
                        </div>
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
