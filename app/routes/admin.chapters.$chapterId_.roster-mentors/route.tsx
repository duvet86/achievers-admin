import type { LoaderFunctionArgs } from "@remix-run/node";
import type { Prisma } from "@prisma/client";

import { json } from "@remix-run/node";
import {
  Link,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import classNames from "classnames";
import { Check, WarningTriangle, NavArrowRight, Calendar } from "iconoir-react";

import {
  debounce,
  getDatesForTerm,
  getValueFromCircularArray,
} from "~/services";
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
  const searchTerm = url.searchParams.get("search") ?? undefined;

  const sortFullNameSubmit: Prisma.SortOrder | undefined =
    (url.searchParams.get("sortFullName") as Prisma.SortOrder) ?? undefined;

  const terms = await getSchoolTermsForYearAsync(dayjs().year());

  const currentTerm =
    terms.find((t) => t.name === selectedTerm) ??
    getCurrentTermForDate(terms, new Date());

  const mentors = await getMentorsAsync(
    Number(params.chapterId),
    sortFullNameSubmit,
    searchTerm,
  );

  return json({
    chapterId: params.chapterId,
    termsList: terms.map(({ start, end, name }) => ({
      value: name,
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")})`,
    })),
    currentTerm,
    mentors,
    datesInTerm: getDatesForTerm(currentTerm.start, currentTerm.end).map(
      (date) => dayjs(date).format("YYYY-MM-DD"),
    ),
    sortFullNameSubmit,
  });
}

const colours = ["#FAD7A0", "#A9DFBF", "#FADBD8", "#AED6F1"];

export default function Index() {
  const initialData = useLoaderData<typeof loader>();
  const { data, state, load, Form } = useFetcher<typeof loader>();
  const [searchParams] = useSearchParams();

  const {
    mentors,
    currentTerm,
    termsList,
    datesInTerm,
    chapterId,
    sortFullNameSubmit,
  } = data ?? initialData;

  const isLoading = state === "loading";

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    searchParams.set("selectedTerm", event.target.value);
    load(`?${searchParams.toString()}`);
  };

  const handleInputChange = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      searchParams.set("search", event.target.value);
      load(`?${searchParams.toString()}`);
    },
  );

  const handleButtonClick = () => {
    searchParams.set("search", "");
    load(`?${searchParams.toString()}`);

    (document.getElementById("search") as HTMLInputElement).value = "";
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

      <div className="flex gap-4 pb-2">
        <Select
          label="Term"
          name="selectedTerm"
          defaultValue={currentTerm.name}
          options={termsList}
          onChange={handleSelectChange}
          disabled={isLoading}
        />

        <Input
          hasButton
          onButtonClick={handleButtonClick}
          label="Filter mentor"
          name="search"
          placeholder="Mentor name"
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>

      <div className="relative overflow-auto">
        {isLoading && (
          <div className="absolute z-30 flex h-full w-full justify-center bg-slate-300 bg-opacity-50">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        <table className="table table-pin-rows table-pin-cols">
          <thead>
            <tr className="z-20">
              <th className="border-r">
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

                  const queryString = `fixedMentorId=${mentorId}&back_url=/admin/chapters/${chapterId}/roster-mentors`;

                  const to = sessionId
                    ? completedOn
                      ? `/admin/sessions/${sessionId}?back_url=/admin/chapters/${chapterId}/roster-mentors`
                      : `/admin/chapters/${chapterId}/sessions/${sessionId}/update-assignment?${queryString}`
                    : `/admin/chapters/${chapterId}/sessions/${attendedOn}T00:00:00Z/new-assignment?${queryString}`;

                  return (
                    <td key={attendedOn} className="border-r">
                      <div className="indicator">
                        {hasReport && (
                          <div className="badge indicator-item badge-success indicator-center gap-1">
                            Report <Check className="h-4 w-4" />
                          </div>
                        )}
                        <div className="w-48">
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
