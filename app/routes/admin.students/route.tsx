import type { Prisma } from "~/prisma/client";
import type { Route } from "./+types/route";

import { Form, useSearchParams, useSubmit } from "react-router";
import { BinFull, PageEdit, Plus } from "iconoir-react";
import classNames from "classnames";

import {
  getLoggedUserInfoAsync,
  getPermissionsAbility,
} from "~/services/.server";
import {
  getPaginationRange,
  URLSafeSearch,
  useStateNavigation,
} from "~/services";
import { Pagination, StateLink, TableHeaderSort, Title } from "~/components";

import {
  getChaptersAsync,
  getStudentsCountAsync,
  getStudentsAsync,
} from "./services.server";
import { FormInputs, ActionsDropdown } from "./components";

export async function loader({ request }: Route.LoaderArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const ability = getPermissionsAbility(loggedUser.roles);

  const url = new URLSafeSearch(request.url);

  const chapterId = url.safeSearchParams.getNullOrEmpty("chapterId");

  const previousPageSubmit = url.safeSearchParams.getNullOrEmpty("previousBtn");
  const pageNumberSubmit = url.safeSearchParams.getNullOrEmpty("pageNumberBtn");
  const nextPageSubmit = url.safeSearchParams.getNullOrEmpty("nextBtn");

  const sortFullNameSubmit: Prisma.SortOrder | undefined =
    (url.safeSearchParams.getNullOrEmpty("sortFullName") as Prisma.SortOrder) ??
    undefined;

  const sortChapterSubmit: Prisma.SortOrder | undefined =
    (url.safeSearchParams.getNullOrEmpty("sortChapter") as Prisma.SortOrder) ??
    undefined;

  const searchTerm = url.safeSearchParams.getNullOrEmpty("searchTerm");
  const pageNumber = Number(url.safeSearchParams.getNullOrEmpty("pageNumber")!);
  const includeArchived =
    url.safeSearchParams.getNullOrEmpty("includeArchived") === "on";

  const chapterIdValue = chapterId !== null ? Number(chapterId) : null;

  const count = await getStudentsCountAsync(
    ability,
    searchTerm,
    chapterIdValue,
    includeArchived,
  );

  const numberItems = 10;
  const totalPageCount = Math.ceil(count / numberItems);

  let currentPageNumber = 0;
  if (previousPageSubmit !== null && pageNumber > 0) {
    currentPageNumber = pageNumber - 1;
  } else if (nextPageSubmit !== null && pageNumber < totalPageCount) {
    currentPageNumber = pageNumber + 1;
  } else if (pageNumberSubmit !== null) {
    currentPageNumber = Number(pageNumberSubmit);
  }

  const [chapters, students] = await Promise.all([
    getChaptersAsync(ability),
    getStudentsAsync(
      ability,
      currentPageNumber,
      searchTerm,
      chapterIdValue,
      sortFullNameSubmit,
      sortChapterSubmit,
      includeArchived,
      numberItems,
    ),
  ]);

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  return {
    currentPageNumber,
    range,
    chapters,
    count,
    students,
    sortFullNameSubmit,
    sortChapterSubmit,
    searchTerm,
    chapterId,
    includeArchived,
  };
}

export default function Index({
  loaderData: {
    chapters,
    students,
    count,
    currentPageNumber,
    range,
    sortFullNameSubmit,
    sortChapterSubmit,
    searchTerm,
    chapterId,
    includeArchived,
  },
}: Route.ComponentProps) {
  const stateNavigate = useStateNavigation();
  const submit = useSubmit();
  const [searchParams] = useSearchParams();

  const totalPageCount = Math.ceil(count / 10);

  const onFormReset = () => {
    searchParams.set("searchTerm", "");
    searchParams.set("chapterId", "");
    searchParams.set("pageNumber", "0");
    searchParams.set("includeArchived", "");

    void submit(Object.fromEntries(searchParams));
  };

  const onChapterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    searchParams.set("chapterId", event.target.value);

    void submit(Object.fromEntries(searchParams));
  };

  const onIncludeArchivedChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    searchParams.set("includeArchived", event.target.checked ? "on" : "");

    void submit(Object.fromEntries(searchParams));
  };

  const navigateToPage = (to: string) => () => {
    void stateNavigate(to);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Title>Students</Title>

        <ActionsDropdown />
      </div>

      <hr className="my-4" />

      <Form>
        <FormInputs
          key={`${searchTerm}-${chapterId}-${includeArchived}`}
          searchTerm={searchTerm}
          chapterId={chapterId}
          includeArchived={includeArchived}
          chapters={chapters}
          onFormClear={onFormReset}
          onChapterChange={onChapterChange}
          onIncludeArchivedChange={onIncludeArchivedChange}
        />

        <div className="overflow-auto bg-white">
          <table className="table">
            <thead>
              <tr>
                <th align="left" className="hidden w-14 sm:table-cell">
                  #
                </th>
                <th align="left" className="w-1/3">
                  <TableHeaderSort
                    sortPropName="sortFullName"
                    sortPropValue={sortFullNameSubmit}
                    label="Full name"
                  />
                </th>
                <th align="left" className="hidden sm:table-cell">
                  Year Level (* calculated based on date of birth)
                </th>
                <th align="left">
                  <TableHeaderSort
                    sortPropName="sortChapter"
                    sortPropValue={sortChapterSubmit}
                    label="Assigned chapter"
                  />
                </th>
                <th align="right" className="hidden sm:table-cell">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <i>No students</i>
                  </td>
                </tr>
              )}
              {students.map(
                ({ id, fullName, yearLevel, chapter, endDate }, index) => (
                  <tr
                    key={id}
                    className={classNames("hover:bg-base-200 cursor-pointer", {
                      "text-error": endDate !== null,
                    })}
                    onClick={navigateToPage(`/admin/students/${id}`)}
                  >
                    <td className="hidden sm:table-cell">
                      <div className="flex gap-2">
                        {index + 1 + 10 * currentPageNumber}{" "}
                        {endDate && <BinFull data-testid="archived" />}
                      </div>
                    </td>
                    <td>{fullName}</td>
                    <td className="hidden sm:table-cell">{yearLevel ?? "-"}</td>
                    <td>{chapter.name}</td>
                    <td className="hidden sm:table-cell">
                      <StateLink
                        to={`${id}?${searchParams.toString()}`}
                        className="btn btn-success btn-xs w-full gap-2"
                      >
                        <PageEdit className="hidden h-4 w-4 lg:block" />
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

        <div className="mt-4 flex flex-col items-center justify-between lg:flex-row">
          <Pagination
            range={range}
            currentPageNumber={currentPageNumber}
            totalPageCount={totalPageCount}
          />

          <StateLink
            className="btn btn-primary mt-4 w-56 gap-4 lg:mt-0"
            to="/admin/students/new"
          >
            <Plus className="h-6 w-6" />
            Add new student
          </StateLink>
        </div>
      </Form>
    </>
  );
}
