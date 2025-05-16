import type { Prisma } from "~/prisma/client";
import type { Route } from "./+types/route";

import { Form, useNavigate, useSearchParams, useSubmit } from "react-router";
import { Eye } from "iconoir-react";

import {
  getLoggedUserInfoAsync,
  getPermissionsAbility,
} from "~/services/.server";
import { getPaginationRange } from "~/services";
import { Pagination, StateLink, TableHeaderSort, Title } from "~/components";

import {
  getChaptersAsync,
  getStudentEoisCountAsync,
  getStudentEoisAsync,
} from "./services.server";
import FormInputs from "./components/FormInputs";

export async function loader({ request }: Route.LoaderArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const ability = getPermissionsAbility(loggedUser.roles);

  const url = new URL(request.url);

  const chapterId = url.searchParams.get("chapterId");
  const includeApprovedStudents =
    url.searchParams.get("includeApprovedStudents") === "on";

  const previousPageSubmit = url.searchParams.get("previousBtn");
  const pageNumberSubmit = url.searchParams.get("pageNumberBtn");
  const nextPageSubmit = url.searchParams.get("nextBtn");

  const sortFullNameSubmit: Prisma.SortOrder | undefined =
    (url.searchParams.get("sortFullName") as Prisma.SortOrder) ?? undefined;

  const sortChapterSubmit: Prisma.SortOrder | undefined =
    (url.searchParams.get("sortChapter") as Prisma.SortOrder) ?? undefined;

  let searchTerm = url.searchParams.get("searchTerm");
  const pageNumber = Number(url.searchParams.get("pageNumber")!);

  if (searchTerm?.trim() === "") {
    searchTerm = null;
  }

  const chapterIdValue =
    chapterId !== null && chapterId !== "" ? Number(chapterId) : null;

  const count = await getStudentEoisCountAsync(
    ability,
    searchTerm,
    chapterIdValue,
    includeApprovedStudents,
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
    getStudentEoisAsync(
      ability,
      currentPageNumber,
      searchTerm,
      chapterIdValue,
      includeApprovedStudents,
      sortFullNameSubmit,
      sortChapterSubmit,
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
    includeApprovedStudents,
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
    includeApprovedStudents,
  },
}: Route.ComponentProps) {
  const submit = useSubmit();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const totalPageCount = Math.ceil(count / 10);

  const onFormReset = () => {
    searchParams.set("searchTerm", "");
    searchParams.set("chapterId", "");
    searchParams.set("pageNumber", "");
    searchParams.set("includeApprovedStudents", "");

    void navigate(`?${searchParams.toString()}`);
  };

  const onChapterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    searchParams.set("chapterId", event.target.value);

    void submit(Object.fromEntries(searchParams));
  };

  const onIncludeApprovedStudentsChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    searchParams.set(
      "includeApprovedStudents",
      event.target.checked ? "on" : "",
    );

    void submit(Object.fromEntries(searchParams));
  };

  return (
    <>
      <Title>Student Expression of Interests</Title>

      <hr className="my-4" />

      <Form>
        <FormInputs
          key={`${searchTerm}-${chapterId}${includeApprovedStudents}`}
          searchTerm={searchTerm}
          chapterId={chapterId}
          includeApprovedStudents={includeApprovedStudents}
          chapters={chapters}
          onFormClear={onFormReset}
          onChapterChange={onChapterChange}
          onIncludeApprovedStudentsChange={onIncludeApprovedStudentsChange}
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
                  Year Level
                </th>
                <th align="left">
                  <TableHeaderSort
                    sortPropName="sortChapter"
                    sortPropValue={sortChapterSubmit}
                    label="Preferred chapter"
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
              {students.map(({ id, fullName, yearLevel, chapter }, index) => {
                return (
                  <tr key={id} className="hover:bg-base-200">
                    <td className="hidden sm:table-cell">
                      <div className="flex gap-2">
                        {index + 1 + 10 * currentPageNumber}
                      </div>
                    </td>
                    <td>{fullName}</td>
                    <td className="hidden sm:table-cell">{yearLevel ?? "-"}</td>
                    <td>{chapter.name}</td>
                    <td className="hidden sm:table-cell">
                      <StateLink
                        to={`${id}?${searchParams.toString()}`}
                        className="btn btn-primary btn-xs w-full gap-2"
                      >
                        <Eye className="hidden h-4 w-4 lg:block" />
                        View
                      </StateLink>
                    </td>
                  </tr>
                );
              })}
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
