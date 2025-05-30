import type { Prisma } from "~/prisma/client";
import type { Route } from "./+types/route";

import { Form, useSearchParams, useNavigate, useSubmit } from "react-router";
import { PageEdit, CheckCircle, WarningTriangle } from "iconoir-react";
import classNames from "classnames";

import {
  getLoggedUserInfoAsync,
  getPermissionsAbility,
} from "~/services/.server";
import { getPaginationRange, isDateExpired } from "~/services";
import { Title, Pagination, TableHeaderSort, StateLink } from "~/components";

import {
  getChaptersAsync,
  getUsersAsync,
  getUsersCountAsync,
} from "./services.server";
import { ActionsDropdown, FormInputs } from "./components";

export async function loader({ request }: Route.LoaderArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const ability = getPermissionsAbility(loggedUser.roles);

  const url = new URL(request.url);

  const chapterId = url.searchParams.get("chapterId");

  const previousPageSubmit = url.searchParams.get("previousBtn");
  const pageNumberSubmit = url.searchParams.get("pageNumberBtn");
  const nextPageSubmit = url.searchParams.get("nextBtn");

  const sortFullNameSubmit: Prisma.SortOrder | undefined =
    (url.searchParams.get("sortFullName") as Prisma.SortOrder) ?? "ASC";

  const sortChapterSubmit: Prisma.SortOrder | undefined =
    (url.searchParams.get("sortChapter") as Prisma.SortOrder) ?? undefined;

  const sortChecksCompletedSubmit: Prisma.SortOrder | undefined =
    (url.searchParams.get("sortChecksCompleted") as Prisma.SortOrder) ??
    undefined;

  let searchTerm = url.searchParams.get("searchTerm");
  const pageNumber = Number(url.searchParams.get("pageNumber")!);

  const onlyExpiredChecks = url.searchParams.get("onlyExpiredChecks") === "on";
  const includeArchived = url.searchParams.get("includeArchived") === "on";

  if (searchTerm?.trim() === "") {
    searchTerm = null;
  }

  const chapterIdValue =
    chapterId !== null && chapterId !== "" ? Number(chapterId) : null;

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
      sortChapterSubmit,
      sortChecksCompletedSubmit,
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
      checksCompleted: Number(user.checksCompleted),
      isAnyChecksExpired:
        isDateExpired(
          user.policeCheckExpiryDate
            ? new Date(user.policeCheckExpiryDate)
            : undefined,
        ) ||
        isDateExpired(
          user.wwccheckExpiryDate
            ? new Date(user.wwccheckExpiryDate)
            : undefined,
        ),
      isReminderSent:
        user.policeCheckReminderSentAt !== null ||
        user.wwccheckReminderSentAt !== null,
    })),
    searchTerm,
    chapterId,
    onlyExpiredChecks,
    includeArchived,
    sortFullNameSubmit,
    sortChapterSubmit,
    sortChecksCompletedSubmit,
  };
}

export default function Index({
  loaderData: {
    chapters,
    users,
    count,
    currentPageNumber,
    range,
    sortFullNameSubmit,
    sortChapterSubmit,
    sortChecksCompletedSubmit,
    searchTerm,
    chapterId,
    onlyExpiredChecks,
    includeArchived,
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
          key={`${searchTerm}-${chapterId}-${onlyExpiredChecks}-${includeArchived}`}
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
                    sortPropName="sortChapter"
                    sortPropValue={sortChapterSubmit}
                    label="Assigned chapter"
                  />
                </th>
                <th align="left">Mobile</th>
                <th align="left">
                  <TableHeaderSort
                    sortPropName="sortChecksCompleted"
                    sortPropValue={sortChecksCompletedSubmit}
                    label="# Checks completed"
                  />
                </th>
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
                    chapterName,
                    checksCompleted,
                    mobile,
                    isAnyChecksExpired,
                    isReminderSent,
                    endDate,
                  },
                  index,
                ) => (
                  <tr key={id} className="hover:bg-base-200">
                    <td className="hidden sm:table-cell">
                      <div className="flex gap-2">
                        {index + 1 + 10 * currentPageNumber}
                      </div>
                    </td>
                    <td>{fullName}</td>
                    <td>{chapterName}</td>
                    <td>{mobile}</td>
                    <td
                      data-testid={
                        endDate !== null
                          ? "archived"
                          : checksCompleted === 8
                            ? "completed"
                            : ""
                      }
                    >
                      <div
                        className={classNames("flex items-center gap-4", {
                          "text-success": checksCompleted === 8,
                        })}
                      >
                        <span>{checksCompleted}/8</span>
                        <div>
                          {isAnyChecksExpired && (
                            <span className="text-warning flex items-center gap-1">
                              <WarningTriangle className="h-4 w-4" /> Expired
                              checks
                            </span>
                          )}
                          {isAnyChecksExpired && isReminderSent && (
                            <span className="text-success flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" /> Reminder sent
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell">
                      <StateLink
                        to={`/admin/users/${id}`}
                        onClick={stopLinkPropagation}
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
