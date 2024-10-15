import type { LoaderFunctionArgs } from "@remix-run/node";
import type { Prisma } from "@prisma/client";

import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";

import { BinFull, PageEdit, Plus } from "iconoir-react";

import {
  getLoggedUserInfoAsync,
  getPermissionsAbility,
} from "~/services/.server";
import { getPaginationRange } from "~/services";
import { Pagination, TableHeaderSort, Title } from "~/components";

import {
  getChaptersAsync,
  getStudentsCountAsync,
  getStudentsAsync,
} from "./services.server";
import FormInputs from "./components/FormInputs";
import ActionsDropdown from "./components/ActionsDropdown";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const ability = getPermissionsAbility(loggedUser.roles);

  const url = new URL(request.url);

  const chapterId = url.searchParams.get("chapterId");

  const previousPageSubmit = url.searchParams.get("previousBtn");
  const pageNumberSubmit = url.searchParams.get("pageNumberBtn");
  const nextPageSubmit = url.searchParams.get("nextBtn");

  const sortFullNameSubmit: Prisma.SortOrder | undefined =
    (url.searchParams.get("sortFullName") as Prisma.SortOrder) ?? undefined;

  const sortChapterSubmit: Prisma.SortOrder | undefined =
    (url.searchParams.get("sortChapter") as Prisma.SortOrder) ?? undefined;

  let searchTerm = url.searchParams.get("searchTerm");
  const pageNumber = Number(url.searchParams.get("pageNumber")!);
  const includeArchived = url.searchParams.get("includeArchived") === "on";

  if (searchTerm?.trim() === "") {
    searchTerm = null;
  }

  const chapterIdValue =
    chapterId !== null && chapterId !== "" ? parseInt(chapterId) : null;

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

export default function Index() {
  const {
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
  } = useLoaderData<typeof loader>();

  const submit = useSubmit();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const totalPageCount = Math.ceil(count / 10);

  const onFormReset = () => {
    searchParams.set("searchTerm", "");
    searchParams.set("chapterId", "");
    searchParams.set("pageNumber", "");
    searchParams.set("includeArchived", "");

    navigate(`?${searchParams.toString()}`);
  };

  const onChapterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    searchParams.set("chapterId", event.target.value);

    submit(Object.fromEntries(searchParams));
  };

  const onIncludeArchivedChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    searchParams.set("includeArchived", event.target.checked ? "on" : "");

    submit(Object.fromEntries(searchParams));
  };

  const handleRowClick = (id: number) => () => {
    navigate(`${id}?${searchParams.toString()}`);
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
                  Year Level
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
                  <td className="border" colSpan={6}>
                    <i>No students</i>
                  </td>
                </tr>
              )}
              {students.map(
                ({ id, fullName, yearLevel, chapter, endDate }, index) => {
                  let className = "cursor-pointer hover:bg-base-200 ";
                  let icon: JSX.Element | undefined;
                  if (endDate) {
                    className += "text-error";
                    icon = <BinFull data-testid="archived" />;
                  }

                  return (
                    <tr
                      key={id}
                      className={className}
                      onClick={handleRowClick(id)}
                    >
                      <td className="hidden border sm:table-cell">
                        <div className="flex gap-2">
                          {index + 1 + 10 * currentPageNumber} {icon}
                        </div>
                      </td>
                      <td className="border">{fullName}</td>
                      <td className="hidden border sm:table-cell">
                        {yearLevel ?? "-"}
                      </td>
                      <td className="border">{chapter.name}</td>
                      <td className="hidden border sm:table-cell">
                        <Link
                          to={`${id}?${searchParams.toString()}`}
                          className="btn btn-success btn-xs w-full gap-2"
                        >
                          <PageEdit className="hidden h-4 w-4 lg:block" />
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                },
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

          <Link
            className="btn btn-primary mt-4 w-56 gap-4 lg:mt-0"
            to="/admin/students/new"
          >
            <Plus className="h-6 w-6" />
            Add new student
          </Link>
        </div>
      </Form>
    </>
  );
}
