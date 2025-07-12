import type { Prisma } from "~/prisma/client";
import type { Route } from "./+types/route";

import { Form, useSearchParams, useSubmit } from "react-router";
import invariant from "tiny-invariant";
import { CoinsSwap, PageEdit } from "iconoir-react";

import { getPaginationRange, URLSafeSearch } from "~/services";
import {
  Title,
  Pagination,
  TableHeaderSort,
  StateLink,
  Input,
} from "~/components";

import {
  getMentorsWithStudentsAsync,
  getMentorsWithStudentsCountAsync,
} from "./services.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");

  const url = new URLSafeSearch(request.url);

  const previousPageSubmit = url.safeSearchParams.getNullOrEmpty("previousBtn");
  const pageNumberSubmit = url.safeSearchParams.getNullOrEmpty("pageNumberBtn");
  const nextPageSubmit = url.safeSearchParams.getNullOrEmpty("nextBtn");

  const sortFullNameSubmit: Prisma.SortOrder | undefined =
    (url.safeSearchParams.getNullOrEmpty("sortFullName") as Prisma.SortOrder) ??
    undefined;

  const sortCountMentorsSubmit: Prisma.SortOrder | undefined =
    (url.safeSearchParams.getNullOrEmpty(
      "sortCountMentors",
    ) as Prisma.SortOrder) ?? undefined;

  const searchTerm = url.safeSearchParams.getNullOrEmpty("searchTerm");
  const pageNumber = Number(url.safeSearchParams.getNullOrEmpty("pageNumber")!);

  const count = await getMentorsWithStudentsCountAsync(
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
    sortCountMentorsSubmit,
  );

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  return {
    searchTerm: searchTerm ?? "",
    range,
    currentPageNumber,
    count,
    mentorsWithStudents,
    sortFullNameSubmit,
    sortCountMentorsSubmit,
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
    sortCountMentorsSubmit,
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
        <Title>Students with Mentors</Title>

        <StateLink
          to={`/admin/chapters/${params.chapterId}/mentors`}
          className="btn w-full sm:w-56"
        >
          <CoinsSwap />
          Swap to mentors view
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
                    <td className="p-2">{fullName}</td>
                    <td>
                      <ul className="list-disc pl-2">
                        {mentorToStudentAssignement.map(({ mentor }) => (
                          <li key={mentor.id}>
                            <span>{mentor.fullName}</span>{" "}
                            <span className="italic">
                              {mentor.frequencyInDays === 14
                                ? "(Fortnightly)"
                                : mentor.frequencyInDays === 7
                                  ? "(Weekly)"
                                  : "(Frequency not specified)"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-2">
                      <StateLink
                        to={`${id}?${searchParams.toString()}`}
                        className="btn btn-success btn-xs w-full"
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
