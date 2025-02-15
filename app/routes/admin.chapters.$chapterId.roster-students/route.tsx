import type { LoaderFunctionArgs } from "react-router";
import type { Prisma } from "@prisma/client/index.js";

import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
  useSubmit,
} from "react-router";
import { useRef } from "react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import classNames from "classnames";
import { Check, NavArrowRight, Calendar, WarningTriangle } from "iconoir-react";

import {
  getCurrentTermForDate,
  getDatesForTerm,
  getValueFromCircularArray,
} from "~/services";
import { getSchoolTermsAsync } from "~/services/.server";
import { Input, Select, TableHeaderSort, Title } from "~/components";

import { getStudentsAsync } from "./services.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
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

  const students = await getStudentsAsync(
    Number(params.chapterId),
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
    students,
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

export default function Index() {
  const {
    students,
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
  } = useLoaderData<typeof loader>();
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

  const onStudentClick = (fullName: string) => () => {
    searchParams.set("search", fullName);
    void navigate({ search: searchParams.toString() });
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Title
          to={
            searchParams.get("back_url")
              ? searchParams.get("back_url")!
              : `/admin/chapters`
          }
        >
          Roster planner STUDENTS
        </Title>

        <Link
          to={`/admin/chapters/${chapterId}/roster-mentors`}
          className="btn w-full sm:w-52"
        >
          <Calendar />
          Roster MENTORS
        </Link>
      </div>

      <hr className="my-4" />

      <Form ref={formRef} className="flex flex-col gap-6 pb-2 sm:flex-row">
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
            label="Filter student (press Enter to submit)"
            name="search"
            placeholder="Student name"
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
                    label="Students"
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
            {students.map(({ id: studentId, fullName, sessionLookup }, i) => (
              <tr
                key={studentId}
                style={{
                  backgroundColor: getValueFromCircularArray(i, colours),
                }}
              >
                <th className="z-10 border-r border-b border-gray-300 border-b-white bg-gray-200">
                  <button
                    type="button"
                    onClick={onStudentClick(fullName)}
                    className={classNames(
                      "link text-start",
                      selectedTermDate ? "sm:w-36" : "sm:w-48",
                    )}
                  >
                    {fullName}
                  </button>
                </th>
                {datesInTerm.map((attendedOn, index) => {
                  const session = sessionLookup[attendedOn];

                  const sessionId = session?.sessionId;
                  const studentSessionId = session?.studentSessionId;
                  const hasReport = session?.hasReport ?? false;
                  const isCancelled = session?.isCancelled ?? false;
                  const completedOn = session?.completedOn;

                  const queryString = `back_url=/admin/chapters/${chapterId}/roster-students?${encodeURIComponent(searchParams.toString())}`;

                  const to = sessionId
                    ? completedOn
                      ? `/admin/student-sessions/${studentSessionId}?${queryString}`
                      : `/admin/student-sessions/${studentSessionId}/remove?${queryString}`
                    : `/admin/chapters/${chapterId}/roster-students/${studentId}/attended-on/${attendedOn}/new?${queryString}`;

                  return (
                    <td key={index} className="border-r border-gray-300">
                      <div
                        className={classNames(
                          "indicator",
                          selectedTermDate ? "w-full" : "w-48",
                        )}
                      >
                        {isCancelled && (
                          <div className="badge indicator-item badge-error indicator-center gap-1">
                            Cancelled <WarningTriangle className="h-4 w-4" />
                          </div>
                        )}
                        {!isCancelled && hasReport && (
                          <div className="badge indicator-item badge-success indicator-center gap-1">
                            Report <Check className="h-4 w-4" />
                          </div>
                        )}
                        <Link to={to} className="btn btn-ghost btn-block">
                          <span className="flex-1">
                            {session?.mentorFullName}
                          </span>
                          <NavArrowRight />
                        </Link>
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
