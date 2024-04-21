import type { LoaderFunctionArgs } from "@remix-run/node";

import {
  useLoaderData,
  Link,
  Form,
  useSearchParams,
  useNavigate,
} from "@remix-run/react";
import { json } from "@remix-run/node";

import { useRef } from "react";
import { PageEdit, BinFull, CheckCircle, WarningTriangle } from "iconoir-react";

import { getPaginationRange, isDateExpired } from "~/services";
import { Title, Pagination } from "~/components";

import {
  getChaptersAsync,
  getUsersAsync,
  getUsersCountAsync,
  getNumberCompletedChecks,
} from "./services.server";

import ActionsDropdown from "./components/ActionsDropdown";
import FormInputs from "./components/FormInputs";

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

  const onlyExpiredChecks = url.searchParams.get("onlyExpiredChecks") === "on";
  const includeArchived = url.searchParams.get("includeArchived") === "on";

  if (searchTerm?.trim() === "" || clearSearchSubmit !== null) {
    searchTerm = null;
  }

  const chapterIdValue =
    chapterId !== null && chapterId !== "" ? parseInt(chapterId) : null;

  const count = await getUsersCountAsync(
    searchTerm,
    chapterIdValue,
    onlyExpiredChecks,
    includeArchived,
  );
  const totalPageCount = Math.ceil(count / 10);

  let currentPageNumber = 0;
  if (searchTermSubmit !== null) {
    currentPageNumber = 0;
  } else if (clearSearchSubmit !== null) {
    currentPageNumber = 0;
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
      onlyExpiredChecks,
      includeArchived,
    ),
  ]);

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  return json({
    chapters,
    count,
    currentPageNumber,
    range,
    users: users.map((user) => ({
      ...user,
      checksCompleted: getNumberCompletedChecks(user),
      isAnyChecksExpired:
        isDateExpired(user.policeCheck?.expiryDate) ||
        isDateExpired(user.wwcCheck?.expiryDate),
    })),
    searchTerm,
  });
}

export default function Index() {
  const { chapters, users, count, currentPageNumber, range } =
    useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formRef = useRef<HTMLFormElement | null>(null);

  const totalPageCount = Math.ceil(count / 10);

  const onFormClear = () => formRef.current!.reset();

  const handleRowClick = (id: number) => () => {
    navigate(`${id}?${searchParams}`);
  };

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
                <th align="left" className="w-14">
                  #
                </th>
                <th align="left">Full name</th>
                <th align="left">Email</th>
                <th align="left">Assigned chapter</th>
                <th align="left"># Checks completed</th>
                <th align="right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td className="border" colSpan={6}>
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
                    chapter,
                    checksCompleted,
                    endDate,
                    isAnyChecksExpired,
                  },
                  index,
                ) => {
                  let className = "cursor-pointer hover:bg-base-200 ";
                  let icon: JSX.Element | undefined;
                  if (checksCompleted === 8) {
                    className += "text-success";
                    icon = <CheckCircle data-testid="completed" />;
                  }
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
                      <td className="border">
                        {firstName} {lastName}
                      </td>
                      <td className="border">{email}</td>
                      <td className="border">{chapter.name}</td>
                      <td className="border">
                        <div className="flex gap-4">
                          <span>{checksCompleted}/8</span>
                          {isAnyChecksExpired && (
                            <span className="flex items-center gap-1 text-warning">
                              <WarningTriangle /> Expired checks
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="border">
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
          range={range}
          currentPageNumber={currentPageNumber}
          totalPageCount={totalPageCount}
        />
      </Form>
    </>
  );
}
