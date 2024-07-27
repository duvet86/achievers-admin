import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { useRef } from "react";

import { BinFull, PageEdit, Plus } from "iconoir-react";

import {
  getLoggedUserInfoAsync,
  getPermissionsAbility,
} from "~/services/.server";
import { getPaginationRange } from "~/services";
import { Pagination, Title } from "~/components";

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

  const searchTermSubmit = url.searchParams.get("searchBtn");
  const clearSearchSubmit = url.searchParams.get("clearSearchBtn");
  const previousPageSubmit = url.searchParams.get("previousBtn");
  const pageNumberSubmit = url.searchParams.get("pageNumberBtn");
  const nextPageSubmit = url.searchParams.get("nextBtn");

  let searchTerm = url.searchParams.get("searchTerm");
  const pageNumber = Number(url.searchParams.get("pageNumber")!);
  const includeArchived = url.searchParams.get("includeArchived") === "on";

  if (searchTerm?.trim() === "" || clearSearchSubmit !== null) {
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
    getChaptersAsync(ability),
    getStudentsAsync(
      ability,
      currentPageNumber,
      searchTerm,
      chapterIdValue,
      includeArchived,
    ),
  ]);

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  return json({
    currentPageNumber,
    range,
    chapters,
    count,
    students,
  });
}

export default function Index() {
  const { chapters, students, count, currentPageNumber, range } =
    useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formRef = useRef<HTMLFormElement | null>(null);

  const totalPageCount = Math.ceil(count / 10);

  const onFormClear = () => formRef.current!.reset();

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
                <th align="left" className="w-14">
                  #
                </th>
                <th align="left" className="w-1/3">
                  Full name
                </th>
                <th align="left">Year Level</th>
                <th align="left">Assigned chapter</th>
                <th align="right">Action</th>
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
                      <td className="border">
                        <div className="flex gap-2">
                          {index + 1 + 10 * currentPageNumber} {icon}
                        </div>
                      </td>
                      <td className="border">{fullName}</td>
                      <td className="border">{yearLevel ?? "-"}</td>
                      <td className="border">{chapter.name}</td>
                      <td className="border">
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
