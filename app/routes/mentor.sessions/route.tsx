import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react";

import { useRef } from "react";
import dayjs from "dayjs";
import { Check, StatsReport, Xmark } from "iconoir-react";

import { getPaginationRange } from "~/services";
import { getLoggedUserInfoAsync } from "~/services/.server";
import { Pagination, Title } from "~/components";

import {
  getSessionsAsync,
  getCountAsync,
  getAssignedStudentsAsync,
  getUserByAzureADIdAsync,
} from "./services.server";
import FormInputs from "./components/FormInputs";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const searchTermSubmit = url.searchParams.get("searchBtn");
  const clearSearchSubmit = url.searchParams.get("clearSearchBtn");
  const previousPageSubmit = url.searchParams.get("previousBtn");
  const pageNumberSubmit = url.searchParams.get("pageNumberBtn");
  const nextPageSubmit = url.searchParams.get("nextBtn");

  const startDateUrl = url.searchParams.get("startDate");
  const endDateUrl = url.searchParams.get("endDate");
  const studentIdUrl = url.searchParams.get("studentId");

  const pageNumber = Number(url.searchParams.get("pageNumber")!);

  let startDate: Date | undefined;
  let endDate: Date | undefined;
  let studentId: number | undefined;

  if (clearSearchSubmit !== null || startDateUrl?.trim() === "") {
    startDate = undefined;
  } else if (startDateUrl) {
    startDate = dayjs(startDateUrl, "YYYY/MM/DD").toDate();
  }
  if (clearSearchSubmit !== null || endDateUrl?.trim() === "") {
    endDate = undefined;
  } else if (endDateUrl) {
    endDate = dayjs(endDateUrl, "YYYY/MM/DD").toDate();
  }
  if (clearSearchSubmit !== null || studentIdUrl?.trim() === "") {
    studentId = undefined;
  } else if (studentIdUrl) {
    studentId = Number(studentIdUrl);
  }

  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  const students = await getAssignedStudentsAsync(user.id);

  const selectedStudentId: number | undefined =
    students.find(({ id }) => id === studentId)?.id ?? students[0]?.id;

  if (selectedStudentId === undefined) {
    return json({
      selectedStudentId,
      students: [],
      sessions: [],
      range: [],
      count: 0,
      currentPageNumber: 0,
    });
  }

  const count = await getCountAsync(
    user.id,
    selectedStudentId,
    startDate,
    endDate,
  );

  const totalPageCount = Math.ceil(count / 10);

  let currentPageNumber = 0;
  if (searchTermSubmit !== null) {
    currentPageNumber = 0;
  } else if (clearSearchSubmit !== null) {
    currentPageNumber = 0;
  } else if (previousPageSubmit !== null && pageNumber > 0) {
    currentPageNumber = pageNumber - 1;
  } else if (nextPageSubmit !== null && pageNumber < totalPageCount) {
    currentPageNumber = pageNumber + 1;
  } else if (pageNumberSubmit !== null) {
    currentPageNumber = Number(pageNumberSubmit);
  }

  const sessions = await getSessionsAsync(
    user.id,
    selectedStudentId,
    startDate,
    endDate,
    currentPageNumber,
  );

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  return json({
    selectedStudentId: selectedStudentId.toString(),
    students,
    sessions,
    range,
    currentPageNumber,
    count,
  });
}

export default function Index() {
  const {
    selectedStudentId,
    students,
    sessions,
    range,
    count,
    currentPageNumber,
  } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const formRef = useRef<HTMLFormElement | null>(null);

  const totalPageCount = Math.ceil(count / 10);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    submit(e.currentTarget);
  };
  const onFormClear = () => formRef.current!.reset();

  return (
    <>
      <Title>Sessions</Title>

      <Form ref={formRef} onChange={handleSubmit}>
        <FormInputs
          selectedStudentId={selectedStudentId}
          students={students}
          onFormClear={onFormClear}
        />

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
                ({ id, attendedOn, completedOn, signedOffOn }, index) => (
                  <tr key={id}>
                    <td className="border-r">{index + 1}</td>
                    <td align="left">
                      {dayjs(attendedOn).format("MMMM D, YYYY")}
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
                    <td align="right">
                      <Link
                        to={`/mentor/sessions/${id}`}
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
