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
  getStudentsCountAsync,
} from "./services.server";
import FormInputs from "./components/FormInputs";
import classNames from "classnames";

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

  const sortCountStudentsSubmit: Prisma.SortOrder | undefined =
    (url.searchParams.get("sortCountStudents") as Prisma.SortOrder) ??
    undefined;

  let searchTerm = url.searchParams.get("searchTerm");
  const pageNumber = Number(url.searchParams.get("pageNumber")!);

  if (searchTerm?.trim() === "" || clearSearchSubmit !== null) {
    searchTerm = null;
  }

  const count = await getStudentsCountAsync(
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
    sortCountStudentsSubmit,
  );

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  return json({
    chapterId: params.chapterId,
    range,
    currentPageNumber,
    count,
    mentorsWithStudents,
    sortFullNameSubmit,
    sortCountStudentsSubmit,
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
    sortCountStudentsSubmit,
  } = useLoaderData<typeof loader>();

  const [searchParams] = useSearchParams();
  const formRef = useRef<HTMLFormElement | null>(null);

  const totalPageCount = Math.ceil(count / 10);

  const onFormClear = () => formRef.current!.reset();

  return (
    <>
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Title
          to={
            searchParams.get("back_url")
              ? searchParams.get("back_url")!
              : "/admin/chapters"
          }
        >
          Mentors with students
        </Title>

        <Link
          to={`/admin/chapters/${chapterId}/students`}
          className="btn w-full sm:w-56"
        >
          <CoinsSwap />
          Swap to students view
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
                    label="Mentors"
                  />
                </th>
                <th align="left" className="hidden p-2 sm:table-cell">
                  Frequency
                </th>
                <th align="left" className="p-2">
                  <TableHeaderSort
                    sortPropName="sortCountStudents"
                    sortPropValue={sortCountStudentsSubmit}
                    label="Students"
                  />
                </th>
                <th align="right" className="p-2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {mentorsWithStudents.map(
                ({
                  id,
                  fullName,
                  frequencyInDays,
                  mentorToStudentAssignement,
                }) => (
                  <tr key={id}>
                    <td className="border p-2">{fullName}</td>
                    <td className="hidden border p-2 sm:table-cell">
                      {frequencyInDays === 14 ? "Fortnightly" : "Weekly"}
                    </td>
                    <td className="border">
                      <ul className="list-disc pl-2">
                        {mentorToStudentAssignement.map(({ student }) => (
                          <li
                            key={student.id}
                            className={classNames("flex gap-2", {
                              "text-error": student.endDate !== null,
                            })}
                          >
                            {student.fullName}
                            {student.endDate !== null && (
                              <p className="font-bold">(Archived)</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="border p-2">
                      <Link
                        to={`${id}?${searchParams.toString()}`}
                        className="btn btn-success btn-xs w-full gap-2"
                      >
                        <PageEdit className="hidden h-4 w-4 sm:block" />
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
