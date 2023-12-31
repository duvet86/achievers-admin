import type { LoaderFunctionArgs } from "@remix-run/node";

import { useLoaderData, Link, Form, useSearchParams } from "@remix-run/react";
import { json } from "@remix-run/node";

import { useRef } from "react";
import { PageEdit, BinFull, CheckCircle } from "iconoir-react";

import { Title } from "~/components";

import {
  getChaptersAsync,
  getUsersAsync,
  getUsersCountAsync,
  getNumberCompletedChecks,
} from "./services.server";

import ActionsDropdown from "./components/ActionsDropdown";
import FormInputs from "./components/FormInputs";
import Pagination from "./components/Pagination";

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

  const count = await getUsersCountAsync(
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

  const [chapters, users] = await Promise.all([
    getChaptersAsync(),
    getUsersAsync(
      currentPageNumber,
      searchTerm,
      chapterIdValue,
      includeArchived,
    ),
  ]);

  return json({
    chapters,
    count,
    currentPageNumber,
    users: users.map((user) => ({
      ...user,
      checksCompleted: getNumberCompletedChecks(user),
    })),
    searchTerm,
  });
}

export default function Index() {
  const { chapters, users, count, currentPageNumber } =
    useLoaderData<typeof loader>();

  const [searchParams] = useSearchParams();
  const formRef = useRef<HTMLFormElement | null>(null);

  const totalPageCount = Math.ceil(count / 10);

  const onFormClear = () => formRef.current!.reset();

  return (
    <>
      <div className="flex items-center">
        <Title>Mentors</Title>

        <div className="flex-1"></div>

        <ActionsDropdown />
      </div>

      <hr className="my-4" />

      <Form ref={formRef} method="get">
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
                  Email
                </th>
                <th align="left" className="p-2">
                  Assigned chapter
                </th>
                <th align="left" className="p-2">
                  # Checks completed
                </th>
                <th align="right" className="p-2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td className="border p-2" colSpan={6}>
                    <i>No users</i>
                  </td>
                </tr>
              )}
              {users.map(
                (
                  {
                    id,
                    firstName,
                    lastName,
                    email,
                    userAtChapter,
                    checksCompleted,
                    endDate,
                  },
                  index,
                ) => {
                  let className: string | undefined;
                  let icon: JSX.Element | undefined;
                  if (checksCompleted === 8) {
                    className = "text-success";
                    icon = <CheckCircle data-testid="completed" />;
                  }
                  if (endDate) {
                    className = "text-error";
                    icon = <BinFull data-testid="archived" />;
                  }

                  return (
                    <tr key={id} className={className}>
                      <td className="border p-2">
                        <div className="flex gap-2">
                          {index + 1 + 10 * currentPageNumber} {icon}
                        </div>
                      </td>
                      <td className="border p-2">
                        {firstName} {lastName}
                      </td>
                      <td className="border p-2">{email}</td>
                      <td className="border p-2">
                        {userAtChapter
                          .map(({ chapter }) => chapter.name)
                          .join(", ")}
                      </td>
                      <td className="border p-2">{checksCompleted}/8</td>
                      <td className="border p-2">
                        <Link
                          to={`${id}?${searchParams}`}
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

        <Pagination
          currentPageNumber={currentPageNumber}
          totalPageCount={totalPageCount}
        />
      </Form>
    </>
  );
}
