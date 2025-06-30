import type { Prisma } from "~/prisma/client";
import type { Route } from "./+types/route";

import { Form, useSearchParams, useSubmit } from "react-router";
import invariant from "tiny-invariant";
import { CoinsSwap, PageEdit } from "iconoir-react";

import { getPaginationRange } from "~/services";
import {
  Title,
  Pagination,
  TableHeaderSort,
  StateLink,
  Input,
} from "~/components";

import {
  getMentorsWithStudentsAsync,
  getStudentsCountAsync,
} from "./services.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");

  const url = new URL(request.url);

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

  if (searchTerm?.trim() === "") {
    searchTerm = null;
  }
  const count = await getStudentsCountAsync(
    Number(params.chapterId),
    searchTerm,
  );

  const totalPageCount = Math.ceil(count / 10);

  let currentPageNumber = 0;
  if (previousPageSubmit !== null && pageNumber > 0) {
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

  return {
    searchTerm: searchTerm ?? "",
    range,
    currentPageNumber,
    count,
    mentorsWithStudents,
    sortFullNameSubmit,
    sortCountStudentsSubmit,
  };
}

export default function Index({
  params,
  loaderData: {
    searchTerm,
    mentorsWithStudents,
    count,
    currentPageNumber,
    range,
    sortFullNameSubmit,
    sortCountStudentsSubmit,
  },
}: Route.ComponentProps) {
  const submit = useSubmit();
  const [searchParams] = useSearchParams();

  const totalPageCount = Math.ceil(count / 10);

  const onFormClear = () => {
    searchParams.set("searchTerm", "");
    searchParams.set("pageNumber", "0");

    void submit(Object.fromEntries(searchParams));
  };

  return (
    <>
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Title>Mentors with students</Title>

        <StateLink
          to={`/admin/chapters/${params.chapterId}/students`}
          className="btn w-full sm:w-56"
        >
          <CoinsSwap />
          Swap to students view
        </StateLink>
      </div>

      <hr className="my-4" />

      <Form>
        <div className="mb-4 w-full sm:w-96">
          <Input
            key={searchTerm}
            name="searchTerm"
            placeholder="Search by name"
            defaultValue={searchTerm}
            hasButton
            onButtonClick={onFormClear}
          />
        </div>

        <div className="overflow-auto bg-white">
          <table className="table-zebra table">
            <thead>
              <tr>
                <th align="left" className="p-2">
                  <TableHeaderSort
                    sortPropName="sortFullName"
                    sortPropValue={sortFullNameSubmit}
                    label="Mentors"
                  />
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
                    <td className="p-2">
                      <span>{fullName}</span>{" "}
                      <span className="italic">
                        {frequencyInDays === 14
                          ? "(Fortnightly)"
                          : frequencyInDays === 7
                            ? "(Weekly)"
                            : "(Frequency not specified)"}
                      </span>
                    </td>
                    <td>
                      <ul className="list-disc pl-2">
                        {mentorToStudentAssignement.map(({ student }) => (
                          <li key={student.id}>{student.fullName}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-2">
                      <StateLink
                        to={`${id}?${searchParams.toString()}`}
                        className="btn btn-success btn-xs w-full gap-2"
                      >
                        <PageEdit className="hidden h-4 w-4 sm:block" />
                        Edit
                      </StateLink>
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
