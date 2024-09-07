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

import { getDatesForTerm, getValueFromCircularArray } from "~/services";
import { Select, TableHeaderSort, Title } from "~/components";

import {
  getCurrentTermForDate,
  getSchoolTermsForYearAsync,
  getStudentsAsync,
} from "./services.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const url = new URL(request.url);
  const selectedTerm = url.searchParams.get("selectedTerm");

  const sortFullNameSubmit: Prisma.SortOrder | undefined =
    (url.searchParams.get("sortFullName") as Prisma.SortOrder) ?? undefined;

  const terms = await getSchoolTermsForYearAsync(dayjs().year());

  const currentTerm =
    terms.find((t) => t.name === selectedTerm) ??
    getCurrentTermForDate(terms, new Date());

  const students = await getStudentsAsync(
    Number(params.chapterId),
    sortFullNameSubmit,
  );

  return json({
    chapterId: params.chapterId,
    termsList: terms.map(({ start, end, name }) => ({
      value: name,
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")})`,
    })),
    currentTerm,
    students,
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
    students,
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

  return (
    <>
      <div className="flex items-center justify-between">
        <Title to="/admin/chapters">Roster planner STUDENTS</Title>

        <Link
          to={`/admin/chapters/${chapterId}/roster-mentors`}
          className="btn min-w-40 gap-2"
        >
          <Calendar className="h-6 w-6" />
          Roster MENTORS
        </Link>
      </div>

      {isLoading && (
        <div className="absolute z-30 flex h-full w-full justify-center bg-slate-300 bg-opacity-50">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      <Select
        label="Term"
        name="selectedTerm"
        defaultValue={currentTerm.name}
        options={termsList}
        onChange={handleSelectChange}
      />

      <div className="overflow-auto">
        <table className="table table-pin-rows table-pin-cols">
          <thead>
            <tr className="z-20">
              <th className="border-r">
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
                <th
                  className="z-10 border-r"
                  style={{
                    backgroundColor: getValueFromCircularArray(i, colours),
                  }}
                >
                  <Link
                    to={`/admin/chapters/${chapterId}/students/${studentId}`}
                    className="link block w-36"
                  >
                    {fullName}
                  </Link>
                </th>
                {datesInTerm.map((attendedOn, index) => {
                  const sessionInfo = sessionLookup[attendedOn];

                  const sessionId = sessionInfo?.sessionId;
                  const hasReport = sessionInfo?.hasReport ?? false;
                  const isCancelled = sessionInfo?.isCancelled ?? false;

                  const to = sessionId
                    ? `/admin/sessions/${sessionId}?back_url=/admin/chapters/${chapterId}/roster-students`
                    : `/admin/sessions/${attendedOn}/chapters/${chapterId}/students/${studentId}/new?back_url=/admin/chapters/${chapterId}/roster-students`;

                  return (
                    <td key={index} className="border-r">
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
                                {sessionInfo?.mentorFullName}
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
