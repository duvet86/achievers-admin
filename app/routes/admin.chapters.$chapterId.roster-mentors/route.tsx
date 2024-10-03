import type { LoaderFunctionArgs } from "@remix-run/node";
import type { Prisma } from "@prisma/client";

import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import classNames from "classnames";
import { Check, WarningTriangle, NavArrowRight, Calendar } from "iconoir-react";

import { getDatesForTerm, getValueFromCircularArray } from "~/services";
import { Input, Select, TableHeaderSort, Title } from "~/components";

import {
  getCurrentTermForDate,
  getSchoolTermsForYearAsync,
  getMentorsAsync,
} from "./services.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const url = new URL(request.url);
  const selectedTerm = url.searchParams.get("selectedTerm");
  let selectedTermDate = url.searchParams.get("selectedTermDate") ?? "";
  const searchTerm = url.searchParams.get("search") ?? undefined;

  const sortFullNameSubmit: Prisma.SortOrder | undefined =
    (url.searchParams.get("sortFullName") as Prisma.SortOrder) ?? undefined;

  const terms = await getSchoolTermsForYearAsync(dayjs().year());

  const todayterm = getCurrentTermForDate(terms, new Date());
  const currentTerm = terms.find((t) => t.name === selectedTerm) ?? todayterm;

  const sessionDates = getDatesForTerm(currentTerm.start, currentTerm.end);

  if (
    selectedTermDate !== "" &&
    !sessionDates.includes(selectedTermDate + "T00:00:00Z")
  ) {
    selectedTermDate = "";
  }

  const mentors = await getMentorsAsync(
    Number(params.chapterId),
    sortFullNameSubmit,
    searchTerm,
  );

  const sessionDateOptions = sessionDates
    .map((attendedOn) => dayjs(attendedOn))
    .map((attendedOn) => ({
      value: attendedOn.format("YYYY-MM-DD"),
      label: attendedOn.format("DD/MM/YYYY"),
    }));

  return json({
    chapterId: params.chapterId,
    termsList: terms.map(({ start, end, name }) => ({
      value: name,
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")}) ${todayterm.name === name ? " (Current)" : ""}`,
    })),
    currentTerm,
    mentors,
    selectedTermDate,
    searchTerm,
    datesInTerm: sessionDateOptions
      .filter(
        ({ value }) => value === selectedTermDate || selectedTermDate === "",
      )
      .map(({ value }) => value),
    sessionDateOptions: [
      {
        value: "",
        label: "All",
      },
    ].concat(sessionDateOptions),
    sortFullNameSubmit,
  });
}

const colours = ["#FAD7A0", "#A9DFBF", "#FADBD8", "#AED6F1"];

export default function Index() {
  const {
    mentors,
    currentTerm,
    termsList,
    datesInTerm,
    selectedTermDate,
    searchTerm,
    sessionDateOptions,
    chapterId,
    sortFullNameSubmit,
  } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleFormSubmit = () => {
    const form = document.getElementById(
      "rosterMentorsForm",
    ) as HTMLFormElement;
    submit(form);
  };

  const handleButtonClick = () => {
    (document.getElementById("search") as HTMLInputElement).value = "";
    handleFormSubmit();
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Title to="/admin/chapters">Roster planner MENTORS</Title>

        <Link
          to={`/admin/chapters/${chapterId}/roster-students`}
          className="btn min-w-40 gap-2"
        >
          <Calendar className="h-6 w-6" />
          Roster STUDENTS
        </Link>
      </div>

      <Form id="rosterMentorsForm" className="flex gap-4 pb-2">
        <Select
          label="Term"
          name="selectedTerm"
          defaultValue={currentTerm.name}
          options={termsList}
          onChange={handleFormSubmit}
        />

        <Select
          label="Session date"
          name="selectedTermDate"
          defaultValue={selectedTermDate}
          options={sessionDateOptions}
          onChange={handleFormSubmit}
        />

        <Input
          hasButton
          label="Filter mentor (press Enter to submit)"
          name="search"
          placeholder="Mentor name"
          defaultValue={searchTerm}
          onButtonClick={handleButtonClick}
        />
      </Form>

      <div className="overflow-auto">
        <table className="table table-pin-rows table-pin-cols">
          <thead>
            <tr className="z-20">
              <th
                className={classNames("border-r", {
                  "w-64": selectedTermDate !== "",
                })}
              >
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
                <th
                  className="z-10 border-r"
                  style={{
                    backgroundColor: getValueFromCircularArray(i, colours),
                  }}
                >
                  <Link
                    to={`/admin/chapters/${chapterId}/mentors/${mentorId}?back_url=/admin/chapters/${chapterId}/roster-mentors`}
                    className="link block w-36"
                  >
                    {fullName}
                  </Link>
                </th>
                {datesInTerm.map((attendedOn) => {
                  const sessionInfo = sessionLookup[attendedOn];

                  const sessionId = sessionInfo?.id;
                  const hasReport = sessionInfo?.hasReport ?? false;
                  const completedOn = sessionInfo?.completedOn;
                  const isCancelled = sessionInfo?.isCancelled ?? false;

                  const queryString = `back_url=/admin/chapters/${chapterId}/roster-mentors`;

                  const to = sessionId
                    ? completedOn
                      ? `/admin/sessions/${sessionId}?back_url=/admin/chapters/${chapterId}/roster-mentors`
                      : `/admin/chapters/${chapterId}/sessions/${sessionId}/mentors/${mentorId}/update-assignment?${queryString}`
                    : `/admin/chapters/${chapterId}/sessions/${attendedOn}/mentors/${mentorId}/assign?${queryString}`;

                  return (
                    <td key={attendedOn} className="border-r">
                      <div className="indicator w-full">
                        {hasReport && (
                          <div className="badge indicator-item badge-success indicator-center gap-1">
                            Report <Check className="h-4 w-4" />
                          </div>
                        )}
                        <div
                          className={
                            selectedTermDate === "" ? "w-48" : "w-full"
                          }
                        >
                          <Link
                            to={to}
                            className={classNames(
                              "btn btn-ghost btn-block justify-between",
                              {
                                "font-bold text-error": isCancelled,
                                "font-bold text-info":
                                  sessionInfo && !sessionInfo.student,
                              },
                            )}
                          >
                            {isCancelled ? (
                              <>
                                <WarningTriangle />
                                Cancelled
                              </>
                            ) : (
                              <span className="flex-1">
                                {sessionInfo
                                  ? sessionInfo.student
                                    ? sessionInfo.student.fullName
                                    : "Marked available"
                                  : ""}
                              </span>
                            )}
                            <NavArrowRight />
                          </Link>
                        </div>
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
