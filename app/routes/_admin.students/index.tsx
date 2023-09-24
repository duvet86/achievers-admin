import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
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

export async function loader({ request }: LoaderArgs) {
  const [chapters, count, students] = await Promise.all([
    getChaptersAsync(),
    getStudentsCountAsync(),
    getStudentsAsync(0),
  ]);

  return json({
    chapters,
    count,
    students,
  });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const chapterId = formData.get("chapterId")?.toString();

  const searchTermSubmit = formData.get("searchBtn")?.toString();
  const clearSearchSubmit = formData.get("clearSearchBtn")?.toString();
  const previousPageSubmit = formData.get("previousBtn")?.toString();
  const pageNumberSubmit = formData.get("pageNumberBtn")?.toString();
  const nextPageSubmit = formData.get("nextBtn")?.toString();

  let searchTerm = formData.get("searchTerm")?.toString();
  const pageNumber = Number(formData.get("pageNumber")!.toString());
  const includeArchived = formData.get("includeArchived")?.toString() === "on";

  const chapterIdValue =
    chapterId !== undefined && chapterId !== ""
      ? parseInt(chapterId)
      : undefined;

  const count = await getStudentsCountAsync(
    searchTerm,
    chapterIdValue,
    includeArchived,
  );
  const totalPageCount = Math.ceil(count / 10);

  if (searchTerm?.trim() === "") {
    searchTerm = undefined;
  }

  let currentPageNumber = 0;
  if (searchTermSubmit !== undefined) {
    currentPageNumber = 0;
  } else if (clearSearchSubmit !== undefined) {
    currentPageNumber = 0;
    searchTerm = undefined;
  } else if (previousPageSubmit !== undefined && pageNumber > 0) {
    currentPageNumber = pageNumber - 1;
  } else if (nextPageSubmit !== undefined && pageNumber < totalPageCount) {
    currentPageNumber = pageNumber + 1;
  } else if (pageNumberSubmit !== undefined) {
    currentPageNumber = Number(pageNumberSubmit);
  }

  const students = await getStudentsAsync(
    currentPageNumber,
    searchTerm,
    chapterIdValue,
    includeArchived,
  );

  return json({
    count,
    currentPageNumber,
    students,
    searchTerm,
  });
}

export default function Index() {
  const { chapters, students, count } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const formRef = useRef<HTMLFormElement | null>(null);

  const totalPageCount = Math.ceil((actionData?.count ?? count) / 10);
  const currentPageNumber = actionData?.currentPageNumber ?? 0;

  const pageStudents = actionData?.students ?? students;

  const onFormSubmit = () => formRef.current!.reset();

  return (
    <>
      <Title>Students</Title>

      <Form ref={formRef} method="post">
        <FormInputs chapters={chapters} onFormSubmit={onFormSubmit} />

        <div className="overflow-auto">
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
              {pageStudents.length === 0 && (
                <tr>
                  <td className="border p-2" colSpan={6}>
                    <i>No users</i>
                  </td>
                </tr>
              )}
              {pageStudents.map(
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
                        to={id.toString()}
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
