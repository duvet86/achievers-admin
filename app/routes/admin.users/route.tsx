import type { JSX } from "react";
import type { LoaderFunctionArgs } from "react-router";
import type { Prisma } from "@prisma/client/index.js";

import {
  useLoaderData,
  Link,
  Form,
  useSearchParams,
  useNavigate,
  useSubmit,
} from "react-router";

import { PageEdit, BinFull, CheckCircle, WarningTriangle } from "iconoir-react";

import {
  getLoggedUserInfoAsync,
  getPermissionsAbility,
} from "~/services/.server";
import { getPaginationRange, isDateExpired } from "~/services";
import { Title, Pagination, TableHeaderSort } from "~/components";

import {
  getChaptersAsync,
  getUsersAsync,
  getUsersCountAsync,
  getNumberCompletedChecks,
} from "./services.server";

import ActionsDropdown from "./components/ActionsDropdown";
import FormInputs from "./components/FormInputs";

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

  const sortEmailSubmit: Prisma.SortOrder | undefined =
    (url.searchParams.get("sortEmail") as Prisma.SortOrder) ?? undefined;

  const sortChapterSubmit: Prisma.SortOrder | undefined =
    (url.searchParams.get("sortChapter") as Prisma.SortOrder) ?? undefined;

  let searchTerm = url.searchParams.get("searchTerm");
  const pageNumber = Number(url.searchParams.get("pageNumber")!);

  const onlyExpiredChecks = url.searchParams.get("onlyExpiredChecks") === "on";
  const includeArchived = url.searchParams.get("includeArchived") === "on";

  if (searchTerm?.trim() === "") {
    searchTerm = null;
  }

  const chapterIdValue =
    chapterId !== null && chapterId !== "" ? parseInt(chapterId) : null;

  const numberItems = 10;

  const count = await getUsersCountAsync(
    ability,
    searchTerm,
    chapterIdValue,
    onlyExpiredChecks,
    includeArchived,
  );
  const totalPageCount = Math.ceil(count / numberItems);

  let currentPageNumber = 0;
  if (previousPageSubmit !== null && pageNumber > 0) {
    currentPageNumber = pageNumber - 1;
  } else if (nextPageSubmit !== null && pageNumber < totalPageCount) {
    currentPageNumber = pageNumber + 1;
  } else if (pageNumberSubmit !== null) {
    currentPageNumber = Number(pageNumberSubmit);
  }

  const [chapters, users] = await Promise.all([
    getChaptersAsync(ability),
    getUsersAsync(
      ability,
      currentPageNumber,
      searchTerm,
      chapterIdValue,
      sortFullNameSubmit,
      sortEmailSubmit,
      sortChapterSubmit,
      onlyExpiredChecks,
      includeArchived,
      numberItems,
    ),
  ]);

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  return {
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
      isReminderSent:
        user.policeCheck?.reminderSentAt !== null ||
        user.wwcCheck?.reminderSentAt !== null,
    })),
    searchTerm,
    chapterId,
    onlyExpiredChecks,
    includeArchived,
    sortFullNameSubmit,
    sortEmailSubmit,
    sortChapterSubmit,
  };
}

export default function Index() {
  const {
    chapters,
    users,
    count,
    currentPageNumber,
    range,
    sortFullNameSubmit,
    sortEmailSubmit,
    sortChapterSubmit,
    searchTerm,
    chapterId,
    onlyExpiredChecks,
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
    searchParams.set("onlyExpiredChecks", "");
    searchParams.set("includeArchived", "");

    void navigate(`?${searchParams.toString()}`);
  };

  const onChapterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    searchParams.set("chapterId", event.target.value);

    void submit(Object.fromEntries(searchParams));
  };

  const onOnlyExpiredChecksChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    searchParams.set("onlyExpiredChecks", event.target.checked ? "on" : "");

    void submit(Object.fromEntries(searchParams));
  };

  const onIncludeArchivedChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    searchParams.set("includeArchived", event.target.checked ? "on" : "");

    void submit(Object.fromEntries(searchParams));
  };

  const handleRowClick = (id: number) => () => {
    void navigate(`${id}?${searchParams.toString()}`);
  };

  const stopLinkPropagation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Title>Mentors</Title>

        <ActionsDropdown />
      </div>

      <hr className="my-4" />

      <Form method="get">
        <FormInputs
          chapters={chapters}
          searchTerm={searchTerm}
          chapterId={chapterId}
          onlyExpiredChecks={onlyExpiredChecks}
          includeArchived={includeArchived}
          onFormReset={onFormReset}
          onChapterChange={onChapterChange}
          onOnlyExpiredChecksChange={onOnlyExpiredChecksChange}
          onIncludeArchivedChange={onIncludeArchivedChange}
        />

        <div className="mt-2 overflow-auto bg-white">
          <table className="table">
            <thead>
              <tr>
                <th align="left" className="hidden w-14 sm:table-cell">
                  #
                </th>
                <th align="left">
                  <TableHeaderSort
                    sortPropName="sortFullName"
                    sortPropValue={sortFullNameSubmit}
                    label="Full name"
                  />
                </th>
                <th align="left">
                  <TableHeaderSort
                    sortPropName="sortEmail"
                    sortPropValue={sortEmailSubmit}
                    label="Email"
                  />
                </th>
                <th align="left">
                  <TableHeaderSort
                    sortPropName="sortChapter"
                    sortPropValue={sortChapterSubmit}
                    label="Assigned chapter"
                  />
                </th>
                <th align="left"># Checks completed</th>
                <th align="right" className="hidden sm:table-cell">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <i>No users</i>
                  </td>
                </tr>
              )}
              {users.map(
                (
                  {
                    id,
                    fullName,
                    email,
                    chapter,
                    checksCompleted,
                    endDate,
                    isAnyChecksExpired,
                    isReminderSent,
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
                      <td className="hidden sm:table-cell">
                        <div className="flex gap-2">
                          {index + 1 + 10 * currentPageNumber} {icon}
                        </div>
                      </td>
                      <td>{fullName}</td>
                      <td>{email}</td>
                      <td>{chapter.name}</td>
                      <td>
                        <div className="flex items-center gap-4">
                          <span>{checksCompleted}/8</span>
                          <div className="flex flex-col gap-1">
                            {isAnyChecksExpired && (
                              <span className="text-warning flex items-center gap-1">
                                <WarningTriangle className="h-4 w-4" /> Expired
                                checks
                              </span>
                            )}
                            {isAnyChecksExpired && isReminderSent && (
                              <span className="text-success flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" /> Reminder
                                sent
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell">
                        <Link
                          to={`${id}?${searchParams.toString()}`}
                          onClick={stopLinkPropagation}
                          className="btn btn-success btn-xs w-full gap-2"
                        >
                          <PageEdit className="hidden h-4 w-4 sm:block" />
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
