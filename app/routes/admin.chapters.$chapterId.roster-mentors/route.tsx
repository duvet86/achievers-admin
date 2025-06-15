import type { Prisma } from "~/prisma/client";
import type { Route } from "./+types/route";

import { Form, useNavigate, useSearchParams, useSubmit } from "react-router";
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
  getValueFromCircularArray,
} from "~/services";
import { getSchoolTermsAsync } from "~/services/.server";
import { Input, Select, StateLink, TableHeaderSort, Title } from "~/components";

import { getMentorsAsync } from "./services.server";

export async function loader({ params, request }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");

  const CURRENT_YEAR = dayjs().year();

  const url = new URL(request.url);
  const selectedTermYear =
    url.searchParams.get("selectedTermYear") ?? CURRENT_YEAR.toString();
  const selectedTermId = url.searchParams.get("selectedTermId");
  let selectedTermDate = url.searchParams.get("selectedTermDate") ?? "";
  const searchTerm = url.searchParams.get("search") ?? undefined;

  const sortFullNameSubmit: Prisma.SortOrder | undefined =
    (url.searchParams.get("sortFullName") as Prisma.SortOrder) ?? undefined;

  const terms = await getSchoolTermsAsync();
  const currentTerm = getCurrentTermForDate(terms, new Date());

  const distinctTermYears = Array.from(new Set(terms.map(({ year }) => year)));
  const termsForYear = terms.filter(
    ({ year }) => year.toString() === selectedTermYear,
  );

  let selectedTerm = termsForYear.find(
    (t) => t.id.toString() === selectedTermId,
  );

  if (!selectedTerm) {
    if (selectedTermYear === CURRENT_YEAR.toString()) {
      selectedTerm = currentTerm;
    } else {
      selectedTerm = termsForYear[0];
    }
  }

  const sessionDates = getDatesForTerm(selectedTerm.start, selectedTerm.end);

  if (selectedTermDate && !sessionDates.includes(selectedTermDate)) {
    selectedTermDate = "";
  }

  const mentors = await getMentorsAsync(
    Number(params.chapterId),
    selectedTerm,
    sortFullNameSubmit,
    searchTerm,
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
    termsOptions: termsForYear.map(({ id, start, end, name }) => ({
      value: id.toString(),
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")}) ${currentTerm.id === id ? " (Current)" : ""}`,
    })),
    selectedTermYear,
    selectedTermId: selectedTerm.id.toString(),
    mentors,
    selectedTermDate,
    searchTerm,
    datesInTerm: sessionDates
      .filter(
        (attendedOn) =>
          attendedOn === selectedTermDate || selectedTermDate === "",
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
    searchTerm,
    sessionDateOptions,
    chapterId,
    sortFullNameSubmit,
  },
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleFormSubmit = () => {
    const formData = new FormData(formRef.current!);
    void submit(formData);
  };

  const handleButtonClick = () => {
    const formData = new FormData(formRef.current!);
    formData.set("search", "");
    void submit(formData);
  };

  const onMentorClick = (fullName: string) => () => {
    searchParams.set("search", fullName);
    void navigate({ search: searchParams.toString() });
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

      <Form ref={formRef} className="flex flex-col gap-4 pb-2 sm:flex-row">
        <div className="w-full sm:w-auto">
          <div key={selectedTermId} className="w-full sm:w-auto">
            <label className="fieldset-label">Term</label>
            <div className="join">
              <select
                className="select join-item basis-28"
                name="selectedTermYear"
                defaultValue={selectedTermYear}
                onChange={handleFormSubmit}
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
                onChange={handleFormSubmit}
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

        <div className="w-full sm:w-auto">
          <Select
            label="Session date"
            name="selectedTermDate"
            defaultValue={selectedTermDate}
            options={sessionDateOptions}
            onChange={handleFormSubmit}
          />
        </div>

        <div className="w-full sm:w-auto">
          <Input
            hasButton
            label="Filter mentor (press Enter to submit)"
            name="search"
            placeholder="Mentor name"
            defaultValue={searchTerm}
            onButtonClick={handleButtonClick}
          />
        </div>
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
                  <button
                    onClick={onMentorClick(fullName)}
                    className={classNames(
                      "link text-start",
                      selectedTermDate ? "sm:w-36" : "sm:w-48",
                    )}
                  >
                    {fullName}
                  </button>
                </th>
                {datesInTerm.map((attendedOn) => {
                  const mentorSession = sessionLookup?.[attendedOn];

                  let hasReport = false;
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
                        isCancelled = session.isCancelled;

                        label = session.studentFullName!;

                        if (isCancelled) {
                          to = `/admin/sessions/${session.sessionId}`;
                        } else if (session.completedOn) {
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
                        {!isCancelled && hasReport && (
                          <div className="badge indicator-item badge-success indicator-center gap-1">
                            Report <Check className="h-4 w-4" />
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
