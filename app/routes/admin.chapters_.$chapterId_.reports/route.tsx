import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useSearchParams } from "@remix-run/react";

import { useRef } from "react";
import { Eye } from "iconoir-react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";

import { getPaginationRange } from "~/services";
import { Pagination, Title } from "~/components";

import {
  getReportsCountAsync,
  getReportsAsync,
  getChapterAsync,
} from "./services.server";
import FormInputs from "./components/FormInputs";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const url = new URL(request.url);

  const searchTermSubmit = url.searchParams.get("searchBtn");
  const clearSearchSubmit = url.searchParams.get("clearSearchBtn");
  const previousPageSubmit = url.searchParams.get("previousBtn");
  const pageNumberSubmit = url.searchParams.get("pageNumberBtn");
  const nextPageSubmit = url.searchParams.get("nextBtn");

  let searchTerm = url.searchParams.get("searchTerm");
  const pageNumber = Number(url.searchParams.get("pageNumber")!);

  if (searchTerm?.trim() === "" || clearSearchSubmit !== null) {
    searchTerm = null;
  }

  const count = await getReportsCountAsync(
    Number(params.chapterId),
    searchTerm,
  );

  const totalPageCount = Math.ceil(count / 10);

  let currentPageNumber = 0;
  if (searchTermSubmit !== null) {
    currentPageNumber = 0;
  } else if (clearSearchSubmit !== null) {
    currentPageNumber = 0;
    searchTerm = null;
  } else if (previousPageSubmit !== null && pageNumber > 0) {
    currentPageNumber = pageNumber - 1;
  } else if (nextPageSubmit !== null && pageNumber < totalPageCount) {
    currentPageNumber = pageNumber + 1;
  } else if (pageNumberSubmit !== null) {
    currentPageNumber = Number(pageNumberSubmit);
  }

  const reports = await getReportsAsync(
    Number(params.chapterId),
    searchTerm,
    currentPageNumber,
  );

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  const chapter = await getChapterAsync(Number(params.chapterId));

  return json({
    chapterName: chapter.name,
    chapterId: params.chapterId,
    range,
    currentPageNumber,
    count,
    reports,
  });
}

export default function Index() {
  const { chapterName, reports, count, currentPageNumber, range } =
    useLoaderData<typeof loader>();

  const [searchParams] = useSearchParams();
  const formRef = useRef<HTMLFormElement | null>(null);

  const totalPageCount = Math.ceil(count / 10);

  const onFormClear = () => formRef.current!.reset();

  return (
    <>
      <Title>Reports for chapter: &quot;{chapterName}&quot;</Title>

      <Form ref={formRef}>
        <FormInputs searchParams={searchParams} onFormClear={onFormClear} />

        <div className="overflow-auto bg-white">
          <table className="table table-zebra">
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
                <th align="left" className="p-2">
                  Completed on
                </th>
                <th align="right" className="p-2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map(
                ({ attendedOn, completedOn, student, user }, index) => (
                  <tr key={index}>
                    <td className="border p-2">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="border p-2">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="border p-2">
                      {dayjs(attendedOn).format("MMMM D, YYYY")}
                    </td>
                    <td className="border p-2">
                      {dayjs(completedOn).format("MMMM D, YYYY")}
                    </td>
                    <td className="border p-2">
                      <Link
                        to={`/admin/users/${user.id}/students/${student.id}/sessions/${attendedOn}`}
                        className="btn btn-success btn-xs w-full gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
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
