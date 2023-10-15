import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { useRef } from "react";

import { PageEdit } from "iconoir-react";

import { Title } from "~/components";

import {
  getChaptersAsync,
  getStudentsCountAsync,
  getStudentsAsync,
} from "./services.server";

import FormInputs from "./components/FormInputs";
import Pagination from "./components/Pagination";
import ActionsDropdown from "./components/ActionsDropdown";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const chapterId = url.searchParams.get("chapterId");

  const searchTermSubmit = url.searchParams.get("searchBtn");
  const clearSearchSubmit = url.searchParams.get("clearSearchBtn");
  const previousPageSubmit = url.searchParams.get("previousBtn");
  const pageNumberSubmit = url.searchParams.get("pageNumberBtn");
  const nextPageSubmit = url.searchParams.get("nextBtn");

  let searchTerm = url.searchParams.get("searchTerm");
  const pageNumber = Number(url.searchParams.get("pageNumber")!);
  const includeArchived = url.searchParams.get("includeArchived") === "on";

  if (searchTerm?.trim() === "") {
    searchTerm = null;
  }

  const chapterIdValue =
    chapterId !== null && chapterId !== "" ? parseInt(chapterId) : null;

  const count = await getStudentsCountAsync(
    searchTerm,
    chapterIdValue,
    includeArchived,
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

  const [chapters, students] = await Promise.all([
    getChaptersAsync(),
    getStudentsAsync(
      currentPageNumber,
      searchTerm,
      chapterIdValue,
      includeArchived,
    ),
  ]);

  return json({
    currentPageNumber,
    chapters,
    count,
    students,
  });
}

export default function Index() {
  const { chapters, students, count, currentPageNumber } =
    useLoaderData<typeof loader>();

  const [searchParams] = useSearchParams();
  const formRef = useRef<HTMLFormElement | null>(null);

  const totalPageCount = Math.ceil(count / 10);

  const onFormClear = () => formRef.current!.reset();

  return (
    <>
      <div className="flex items-center">
        <Title>Students</Title>

        <div className="flex-1"></div>

        <ActionsDropdown />
      </div>

      <hr className="my-4" />

      <Form ref={formRef}>
        <FormInputs
          chapters={chapters}
          searchParams={searchParams}
          onFormClear={onFormClear}
        />

        <div className="overflow-auto bg-white">
          <table className="table">
            <thead>
              <tr>
                <th align="left" className="w-14 p-2">
                  #
                </th>
                <th align="left" className="p-2">
                  Full name
                </th>
                <th align="left" className="p-2">
                  Year Level
                </th>
                <th align="left" className="p-2">
                  Assigned chapter
                </th>
                <th align="right" className="p-2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr>
                  <td className="border p-2" colSpan={6}>
                    <i>No students</i>
                  </td>
                </tr>
              )}
              {students.map(
                (
                  { id, firstName, lastName, yearLevel, studentAtChapter },
                  index,
                ) => (
                  <tr key={id}>
                    <td className="border p-2">
                      <div className="flex gap-2">
                        {index + 1 + 10 * currentPageNumber}
                      </div>
                    </td>
                    <td className="border p-2">
                      {firstName} {lastName}
                    </td>
                    <td className="border p-2">{yearLevel}</td>
                    <td className="border p-2">
                      {studentAtChapter
                        .map(({ chapter }) => chapter.name)
                        .join(", ")}
                    </td>
                    <td className="border p-2">
                      <Link
                        to={`${id}?${searchParams}`}
                        className="btn btn-success btn-xs w-full gap-2"
                      >
                        <PageEdit className="h-4 w-4" />
                        Edit
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
          currentPageNumber={currentPageNumber}
          totalPageCount={totalPageCount}
        />
      </Form>
    </>
  );
}
