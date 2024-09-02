import type { LoaderFunctionArgs } from "@remix-run/node";
import type { Prisma } from "@prisma/client";

import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useSearchParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { useRef } from "react";
import { CoinsSwap, PageEdit } from "iconoir-react";

import { getPaginationRange } from "~/services";
import { Title, Pagination, TableHeaderSort } from "~/components";

import {
  getMentorsWithStudentsAsync,
  getMentorsWithStudentsCountAsync,
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

  const sortFullNameSubmit: Prisma.SortOrder | undefined =
    (url.searchParams.get("sortFullName") as Prisma.SortOrder) ?? undefined;

  const sortCountMentorsSubmit: Prisma.SortOrder | undefined =
    (url.searchParams.get("sortCountMentors") as Prisma.SortOrder) ?? undefined;

  let searchTerm = url.searchParams.get("searchTerm");
  const pageNumber = Number(url.searchParams.get("pageNumber")!);

  if (searchTerm?.trim() === "" || clearSearchSubmit !== null) {
    searchTerm = null;
  }

  const count = await getMentorsWithStudentsCountAsync(
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

  const mentorsWithStudents = await getMentorsWithStudentsAsync(
    Number(params.chapterId),
    searchTerm,
    currentPageNumber,
    sortFullNameSubmit,
    sortCountMentorsSubmit,
  );

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  return json({
    chapterId: params.chapterId,
    range,
    currentPageNumber,
    count,
    mentorsWithStudents,
    sortFullNameSubmit,
    sortCountMentorsSubmit,
  });
}

export default function Index() {
  const {
    chapterId,
    mentorsWithStudents,
    count,
    currentPageNumber,
    range,
    sortFullNameSubmit,
    sortCountMentorsSubmit,
  } = useLoaderData<typeof loader>();

  const [searchParams] = useSearchParams();
  const formRef = useRef<HTMLFormElement | null>(null);

  const totalPageCount = Math.ceil(count / 10);

  const onFormClear = () => formRef.current!.reset();

  return (
    <>
      <div className="flex items-center justify-between">
        <Title to="/admin/chapters">Students with Mentors</Title>

        <Link
          to={`/admin/chapters/${chapterId}/mentors`}
          className="btn min-w-40 gap-2"
        >
          <CoinsSwap className="h-6 w-6" />
          Swap to mentors view
        </Link>
      </div>

      <hr className="my-4" />

      <Form ref={formRef}>
        <FormInputs searchParams={searchParams} onFormClear={onFormClear} />

        <div className="overflow-auto bg-white">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th align="left" className="p-2">
                  <TableHeaderSort
                    sortPropName="sortFullName"
                    sortPropValue={sortFullNameSubmit}
                    label="Students"
                  />
                </th>
                <th align="left" className="p-2">
                  <TableHeaderSort
                    sortPropName="sortCountMentors"
                    sortPropValue={sortCountMentorsSubmit}
                    label="Mentors"
                  />
                </th>
                <th align="right" className="p-2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {mentorsWithStudents.map(
                ({ id, fullName, mentorToStudentAssignement }) => (
                  <tr key={id}>
                    <td className="border p-2">{fullName}</td>
                    <td className="border">
                      <ul className="list-disc pl-2">
                        {mentorToStudentAssignement.map(({ user }) => (
                          <li key={user.id}>{user.fullName}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="border p-2">
                      <Link
                        to={`${id}?${searchParams.toString()}`}
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
          range={range}
          currentPageNumber={currentPageNumber}
          totalPageCount={totalPageCount}
        />
      </Form>
    </>
  );
}
