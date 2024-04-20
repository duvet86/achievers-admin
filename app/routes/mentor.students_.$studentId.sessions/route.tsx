import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";

import { useRef } from "react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import { Check, StatsReport, Xmark } from "iconoir-react";

import {
  getCurrentUserADIdAsync,
  getUserByAzureADIdAsync,
} from "~/services/.server";
import { Pagination, Title } from "~/components";

import {
  getSessionsForStudentAsync,
  getSessionsForStudentCountAsync,
  getStudentAsync,
} from "./services.server";
import { getPaginationRange } from "~/services";
import FormInputs from "./components/FormInputs";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.studentId, "studentId not found");

  const url = new URL(request.url);

  const searchTermSubmit = url.searchParams.get("searchBtn");
  const clearSearchSubmit = url.searchParams.get("clearSearchBtn");
  const previousPageSubmit = url.searchParams.get("previousBtn");
  const pageNumberSubmit = url.searchParams.get("pageNumberBtn");
  const nextPageSubmit = url.searchParams.get("nextBtn");

  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const pageNumber = Number(url.searchParams.get("pageNumber")!);

  let startDateConverted: Date | null = null;
  let endDateConverted: Date | null = null;

  if (startDate?.trim() === "" || clearSearchSubmit !== null) {
    startDateConverted = null;
  } else if (startDate) {
    startDateConverted = dayjs(startDate, "YYYY/MM/DD").toDate();
  }
  if (endDate?.trim() === "" || clearSearchSubmit !== null) {
    endDateConverted = null;
  } else if (endDate) {
    endDateConverted = dayjs(endDate, "YYYY/MM/DD").toDate();
  }

  const azureUserId = await getCurrentUserADIdAsync(request);
  const user = await getUserByAzureADIdAsync(azureUserId);

  const student = await getStudentAsync(Number(params.studentId));

  const count = await getSessionsForStudentCountAsync(
    user.id,
    user.chapterId,
    student.id,
    startDateConverted,
    endDateConverted,
  );

  const totalPageCount = Math.ceil(count / 10);

  let currentPageNumber = 0;
  if (searchTermSubmit !== null) {
    currentPageNumber = 0;
  } else if (clearSearchSubmit !== null) {
    currentPageNumber = 0;
    startDateConverted = null;
    endDateConverted = null;
  } else if (previousPageSubmit !== null && pageNumber > 0) {
    currentPageNumber = pageNumber - 1;
  } else if (nextPageSubmit !== null && pageNumber < totalPageCount) {
    currentPageNumber = pageNumber + 1;
  } else if (pageNumberSubmit !== null) {
    currentPageNumber = Number(pageNumberSubmit);
  }

  const sessions = await getSessionsForStudentAsync(
    user.id,
    user.chapterId,
    student.id,
    startDateConverted,
    endDateConverted,
    currentPageNumber,
  );

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  return json({
    student,
    sessions,
    range,
    currentPageNumber,
    count,
  });
}

export default function Index() {
  const { student, sessions, range, count, currentPageNumber } =
    useLoaderData<typeof loader>();

  const formRef = useRef<HTMLFormElement | null>(null);

  const totalPageCount = Math.ceil(count / 10);

  const onFormClear = () => formRef.current!.reset();

  return (
    <>
      <Title>
        Sessions for &quot;{student.firstName} {student.lastName}&quot;
      </Title>

      <Form ref={formRef}>
        <FormInputs onFormClear={onFormClear} />

        <div className="overflow-auto bg-white">
          <table className="table table-lg">
            <thead>
              <tr>
                <th className="w-6">#</th>
                <th align="left">Session date</th>
                <th align="left">Report completed</th>
                <th align="left">Signed off</th>
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
                ({ attendedOn, completedOn, signedOffOn }, index) => (
                  <tr key={index}>
                    <td className="border-r">{index + 1}</td>
                    <td align="left">
                      {dayjs(attendedOn).format("MMMM D, YYYY")}
                    </td>
                    <td align="left">
                      {signedOffOn ? (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          {dayjs(signedOffOn).format("MMMM D, YYYY")}
                        </div>
                      ) : (
                        <Xmark className="h-4 w-4 text-error" />
                      )}
                    </td>
                    <td align="left">
                      {completedOn ? (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          {dayjs(completedOn).format("MMMM D, YYYY")}
                        </div>
                      ) : (
                        <Xmark className="h-4 w-4 text-error" />
                      )}
                    </td>
                    <td align="right">
                      <Link
                        to={`/mentor/students/${student.id}/sessions/${attendedOn}`}
                        className="btn btn-success btn-xs h-8 gap-2"
                      >
                        <StatsReport className="hidden h-4 w-4 lg:block" />
                        View report
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
