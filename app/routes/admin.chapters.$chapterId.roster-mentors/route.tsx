import type { Prisma } from "~/prisma/client";
import type { Route } from "./+types/route";

import { Form, useSearchParams, useSubmit } from "react-router";
import { useRef } from "react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import classNames from "classnames";
import {
  Check,
  NavArrowRight,
  Calendar,
  DatabaseExport,
  WarningTriangle,
} from "iconoir-react";

import {
  getCurrentTermForDate,
  getDatesForTerm,
  getDistinctTermYears,
  getSelectedTerm,
  getValueFromCircularArray,
  URLSafeSearch,
} from "~/services";
import { getSchoolTermsAsync } from "~/services/.server";
import { Input, Select, StateLink, TableHeaderSort, Title } from "~/components";

import { getMentorsAsync } from "./services.server";

export async function loader({ params, request }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");

  const CURRENT_YEAR = dayjs().year();

  const url = new URLSafeSearch(request.url);

  const selectedTermYear =
    url.safeSearchParams.getNullOrEmpty("selectedTermYear") ??
    CURRENT_YEAR.toString();
  const selectedTermId = url.safeSearchParams.getNullOrEmpty("selectedTermId");
  let selectedTermDate =
    url.safeSearchParams.getNullOrEmpty("selectedTermDate");
  const selectedStatus = url.safeSearchParams.getNullOrEmpty("selectedStatus");
  const searchTerm = url.safeSearchParams.getNullOrEmpty("search");

  const sortFullNameSubmit: Prisma.SortOrder | undefined =
    (url.safeSearchParams.getNullOrEmpty("sortFullName") as Prisma.SortOrder) ??
    undefined;

  const terms = await getSchoolTermsAsync();

  const { selectedTerm, termsForYear } = getSelectedTerm(
    terms,
    selectedTermYear,
    selectedTermId,
    selectedTermDate,
  );

  const currentTerm = getCurrentTermForDate(terms, new Date());
  const distinctTermYears = getDistinctTermYears(terms);
  const sessionDates = getDatesForTerm(selectedTerm.start, selectedTerm.end);

  if (selectedTermDate && !sessionDates.includes(selectedTermDate)) {
    selectedTermDate = null;
  }

  const mentors = await getMentorsAsync(
    Number(params.chapterId),
    selectedTerm,
    sortFullNameSubmit,
    searchTerm,
    selectedStatus,
    selectedTermDate,
  );

  const sessionDateOptions = sessionDates
    .map((attendedOn) => dayjs(attendedOn))
    .map((attendedOn) => ({
      value: attendedOn.toISOString(),
      label:
        attendedOn.format("DD/MM/YYYY") +
        (attendedOn === dayjs() ? " (Today)" : ""),
    }));

  return {
    chapterId: params.chapterId,
    termYearsOptions: distinctTermYears.map((year) => ({
      value: year.toString(),
      label: year.toString(),
    })),
    termsOptions: termsForYear.map(({ id, start, end, label }) => ({
      value: id.toString(),
      label: `${label} (${start.format("D MMMM")} - ${end.format("D MMMM")}) ${currentTerm.id === id ? " (Current)" : ""}`,
    })),
    selectedTermYear,
    selectedTermId: selectedTerm.id.toString(),
    mentors,
    selectedTermDate,
    selectedStatus,
    searchTerm,
    datesInTerm: sessionDates
      .filter(
        (attendedOn) =>
          attendedOn === selectedTermDate || selectedTermDate === null,
      )
      .map((attendedOn) => dayjs(attendedOn).format("YYYY-MM-DD")),
    sessionDateOptions: [{ value: "", label: "All" }].concat(
      sessionDateOptions,
    ),
    sortFullNameSubmit,
  };
}

const colours = ["#FAD7A0", "#A9DFBF", "#FADBD8", "#AED6F1"];

export default function Index({
  loaderData: {
    mentors,
    selectedTermYear,
    selectedTermId,
    termYearsOptions,
    termsOptions,
    datesInTerm,
    selectedTermDate,
    selectedStatus,
    searchTerm,
    sessionDateOptions,
    chapterId,
    sortFullNameSubmit,
  },
}: Route.ComponentProps) {
  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  const formRef = useRef<HTMLFormElement | null>(null);

  const onTermYearChange = () => {
    const formData = new FormData(formRef.current!);

    formData.set("selectedTermId", "");
    formData.set("selectedTermDate", "");

    void submit(formData);
  };

  const onTermIdChange = () => {
    const formData = new FormData(formRef.current!);

    formData.set("selectedTermDate", "");

    void submit(formData);
  };

  const onFormChange = () => {
    const formData = new FormData(formRef.current!);

    void submit(formData);
  };

  const onClearSearch = () => {
    const formData = new FormData(formRef.current!);
    formData.set("search", "");

    void submit(formData);
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Title>Roster planner MENTORS</Title>

        <div className="flex gap-4">
          <a
            className="btn w-full sm:w-52"
            href={`/admin/chapters/${chapterId}/roster-mentors/export/?${searchParams}`}
            download
          >
            <DatabaseExport />
            Export roster
          </a>

          <StateLink
            to={`/admin/chapters/${chapterId}/roster-students`}
            className="btn w-full sm:w-52"
          >
            <Calendar />
            Roster STUDENTS
          </StateLink>
        </div>
      </div>

      <hr className="my-4" />

      <Form ref={formRef} className="flex flex-col gap-4 pb-2 xl:flex-row">
        <div className="w-full xl:w-auto">
          <div key={selectedTermId} className="w-full xl:w-auto">
            <label className="fieldset-label">Term</label>
            <div className="join w-full">
              <select
                className="select join-item basis-28"
                name="selectedTermYear"
                defaultValue={selectedTermYear}
                onChange={onTermYearChange}
              >
                {termYearsOptions.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                className="select join-item w-full"
                name="selectedTermId"
                defaultValue={selectedTermId}
                onChange={onTermIdChange}
              >
                {termsOptions.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="w-full min-w-36 sm:w-auto">
          <Select
            label="Session date"
            name="selectedTermDate"
            defaultValue={selectedTermDate ?? ""}
            options={sessionDateOptions}
            onChange={onFormChange}
          />
        </div>

        <div className="w-full sm:w-auto">
          <Input
            hasButton
            label="Mentor (press Enter to submit)"
            name="search"
            placeholder="Mentor name"
            defaultValue={searchTerm ?? ""}
            onButtonClick={onClearSearch}
          />
        </div>

        <div className="w-full min-w-36 sm:w-auto">
          <Select
            label="Status"
            name="selectedStatus"
            defaultValue={selectedStatus ?? ""}
            options={[
              {
                label: "All",
                value: "",
              },
              {
                label: "Available",
                value: "AVAILABLE",
              },
              {
                label: "Unavailable",
                value: "UNAVAILABLE",
              },
            ]}
            onChange={onFormChange}
          />
        </div>

        <fieldset className="ml-4 flex gap-4 rounded border p-2">
          <legend className="fieldset-legend">Legend</legend>
          <div className="flex gap-2">
            <div className="badge badge-success gap-1">
              Report <Check className="h-4 w-4" />
            </div>
            <span>Report completed</span>
          </div>
          <div className="flex gap-2">
            <div className="badge badge-warning gap-1">
              Report <WarningTriangle className="h-4 w-4" />
            </div>
            <span>Report written but NOT completed</span>
          </div>
          <div className="flex gap-2">
            <div className="badge badge-error gap-1">
              Canceled <WarningTriangle className="h-4 w-4" />
            </div>
            <span>Session cancelled</span>
          </div>
        </fieldset>
      </Form>

      <div className="overflow-auto">
        <table className="table-pin-rows table-pin-cols table">
          <thead>
            <tr className="z-20">
              <th className="border-r border-gray-300 sm:w-64">
                <Form>
                  <TableHeaderSort
                    sortPropName="sortFullName"
                    sortPropValue={sortFullNameSubmit}
                    label="Mentors"
                  />
                </Form>
              </th>
              {datesInTerm.map((attendedOn, index) => (
                <td key={index}>
                  <div className="flex flex-col items-center font-medium text-gray-800">
                    <span>{dayjs(attendedOn).format("dddd")}</span>
                    <span>{dayjs(attendedOn).format("DD/MM/YYYY")}</span>
                  </div>
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {mentors.map(({ id: mentorId, fullName, sessionLookup }, i) => (
              <tr
                key={mentorId}
                style={{
                  backgroundColor: getValueFromCircularArray(i, colours),
                }}
              >
                <th className="z-10 border-r border-b border-gray-300 border-b-white bg-gray-200">
                  <div
                    className={classNames(
                      "link text-start",
                      selectedTermDate ? "sm:w-36" : "sm:w-48",
                    )}
                  >
                    <StateLink
                      to={`/admin/mentors/${mentorId}`}
                      className="link text-start"
                    >
                      {fullName}
                    </StateLink>
                  </div>
                </th>
                {datesInTerm.map((attendedOn) => {
                  const mentorSession = sessionLookup?.[attendedOn];

                  let hasReport = false;
                  let completedOn = null;
                  let isCancelled = false;
                  let label = "";
                  let textHighlight = false;
                  let textHighlightError = false;

                  let to = mentorSession?.mentorSessionId
                    ? `/admin/chapters/${chapterId}/roster-mentors/mentor-sessions/${mentorSession.mentorSessionId}`
                    : `/admin/chapters/${chapterId}/roster-mentors/${mentorId}/attended-on/${attendedOn}/new`;

                  if (mentorSession) {
                    if (mentorSession.status === "UNAVAILABLE") {
                      textHighlightError = true;
                      label = "Unavailable";
                    } else {
                      if (mentorSession.sessions.length === 0) {
                        textHighlight = true;
                        label = "Available";
                      } else if (mentorSession.sessions.length === 1) {
                        const session = mentorSession.sessions[0];
                        hasReport = session.hasReport;
                        completedOn = session.completedOn;
                        isCancelled = session.isCancelled;

                        label = session.studentFullName!;

                        if (isCancelled) {
                          to = `/admin/sessions/${session.sessionId}`;
                        } else if (hasReport) {
                          to = `/admin/sessions/${session.sessionId}/report`;
                        }
                      } else {
                        label = `${mentorSession.sessions.length} Students`;
                      }
                    }
                  }

                  return (
                    <td key={attendedOn} className="border-r border-gray-300">
                      <div
                        className={classNames(
                          "indicator",
                          selectedTermDate ? "w-full" : "w-48",
                        )}
                      >
                        {isCancelled && (
                          <div className="badge indicator-item badge-error indicator-center gap-1">
                            Canceled <WarningTriangle className="h-4 w-4" />
                          </div>
                        )}
                        {!isCancelled && hasReport && completedOn && (
                          <div className="badge indicator-item badge-success indicator-center gap-1">
                            Report <Check className="h-4 w-4" />
                          </div>
                        )}
                        {!isCancelled && hasReport && !completedOn && (
                          <div className="badge indicator-item badge-warning indicator-center gap-1">
                            Report <WarningTriangle className="h-4 w-4" />
                          </div>
                        )}
                        <StateLink
                          to={to}
                          className={classNames(
                            "btn btn-ghost btn-block justify-between truncate font-bold",
                            {
                              "text-info": textHighlight,
                              "text-error": textHighlightError,
                            },
                          )}
                        >
                          <span className="flex-1">{label}</span>
                          <NavArrowRight />
                        </StateLink>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
