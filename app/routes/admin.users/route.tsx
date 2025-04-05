import type { JSX } from "react";
import type { LoaderFunctionArgs } from "react-router";
import type { Prisma } from "@prisma/client/index.js";

import {
  useLoaderData,
  Form,
  useSearchParams,
  useNavigate,
  useSubmit,
} from "react-router";
import dayjs from "dayjs";
import { PageEdit, BinFull, CheckCircle, WarningTriangle } from "iconoir-react";

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
    (url.searchParams.get("sortFullName") as Prisma.SortOrder) ?? "ASC";

  const sortChapterSubmit: Prisma.SortOrder | undefined =
    (url.searchParams.get("sortChapter") as Prisma.SortOrder) ?? undefined;

  const sortCreatedAtSubmit: Prisma.SortOrder | undefined =
    (url.searchParams.get("sortCreatedAt") as Prisma.SortOrder) ?? undefined;

  const sortChecksCompletedSubmit: Prisma.SortOrder | undefined =
    (url.searchParams.get("sortChecksCompleted") as Prisma.SortOrder) ??
    undefined;

  let searchTerm = url.searchParams.get("searchTerm");
  const pageNumber = Number(url.searchParams.get("pageNumber")!);

  const onlyExpiredChecks = url.searchParams.get("onlyExpiredChecks") === "on";
  const includeArchived = url.searchParams.get("includeArchived") === "on";
  const includeCompleteChecks =
    url.searchParams.get("includeCompleteChecks") === "on";

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
    includeCompleteChecks,
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
      sortCreatedAtSubmit,
      sortChecksCompletedSubmit,
      onlyExpiredChecks,
      includeArchived,
      includeCompleteChecks,
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
    includeCompleteChecks,
    includeArchived,
    sortFullNameSubmit,
    sortChapterSubmit,
    sortCreatedAtSubmit,
    sortChecksCompletedSubmit,
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
    sortChapterSubmit,
    sortCreatedAtSubmit,
    sortChecksCompletedSubmit,
    searchTerm,
    chapterId,
    onlyExpiredChecks,
    includeCompleteChecks,
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
    searchParams.set("includeCompleteChecks", "");
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

  const onIncludeCompleteChecksChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    searchParams.set("includeCompleteChecks", event.target.checked ? "on" : "");

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
          chapters={chapters}
          searchTerm={searchTerm}
          chapterId={chapterId}
          onlyExpiredChecks={onlyExpiredChecks}
          includeArchived={includeArchived}
          includeCompleteChecks={includeCompleteChecks}
          onFormReset={onFormReset}
          onChapterChange={onChapterChange}
          onOnlyExpiredChecksChange={onOnlyExpiredChecksChange}
          onIncludeCompleteChecksChange={onIncludeCompleteChecksChange}
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
                <th align="left">
                  <TableHeaderSort
                    sortPropName="sortCreatedAt"
                    sortPropValue={sortCreatedAtSubmit}
                    label="Created At"
                  />
                </th>
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
                    endDate,
                    createdAt,
                    isAnyChecksExpired,
                    isReminderSent,
                  },
                  index,
                ) => {
                  let className = "hover:bg-base-200 ";
                  let icon: JSX.Element | undefined;
                  if (endDate) {
                    className += "text-error";
                    icon = <BinFull data-testid="archived" />;
                  } else if (checksCompleted === 8) {
                    className += "text-success";
                    icon = <CheckCircle data-testid="completed" />;
                  }

                  return (
                    <tr key={id} className={className}>
                      <td className="hidden sm:table-cell">
                        <div className="flex gap-2">
                          {index + 1 + 10 * currentPageNumber} {icon}
                        </div>
                      </td>
                      <td>{fullName}</td>
                      <td>{chapterName}</td>
                      <td>{dayjs(createdAt).format("DD/MM/YYYY")}</td>
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
