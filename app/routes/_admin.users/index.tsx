import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { useLoaderData, Link, Form, useActionData } from "@remix-run/react";
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

import ActionsDropdown from "./ActionsDropdown";
import FormInputs from "./FormInputs";
import Pagination from "./Pagination";

export async function loader({ request }: LoaderArgs) {
  const [chapters, count, users] = await Promise.all([
    getChaptersAsync(),
    getUsersCountAsync(),
    getUsersAsync(0),
  ]);

  return json({
    chapters,
    count,
    users: users.map((user) => ({
      ...user,
      checksCompleted: getNumberCompletedChecks(user),
    })),
  });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const chapterId = formData.get("chapterId")?.toString();

  const searchTermSubmit = formData.get("searchBtn")?.toString();
  const clearSearchSubmit = formData.get("clearSearchBtn")?.toString();
  const previousPageSubmit = formData.get("previousBtn")?.toString();
  const pageNumberSubmit = formData.get("pageNumberBtn")?.toString();
  const nextPageSubmit = formData.get("nextBtn")?.toString();

  let searchTerm = formData.get("searchTerm")?.toString();
  const pageNumber = Number(formData.get("pageNumber")!.toString());
  const includeAllUsers = formData.get("allUsers")?.toString() === "on";

  const chapterIdValue =
    chapterId !== undefined && chapterId !== ""
      ? parseInt(chapterId)
      : undefined;

  const count = await getUsersCountAsync(
    searchTerm,
    chapterIdValue,
    includeAllUsers,
  );
  const totalPageCount = Math.ceil(count / 10);

  if (searchTerm?.trim() === "") {
    searchTerm = undefined;
  }

  let currentPageNumber = 0;
  if (searchTermSubmit !== undefined) {
    currentPageNumber = 0;
  } else if (clearSearchSubmit !== undefined) {
    currentPageNumber = 0;
    searchTerm = undefined;
  } else if (previousPageSubmit !== undefined && pageNumber > 0) {
    currentPageNumber = pageNumber - 1;
  } else if (nextPageSubmit !== undefined && pageNumber < totalPageCount) {
    currentPageNumber = pageNumber + 1;
  } else if (pageNumberSubmit !== undefined) {
    currentPageNumber = Number(pageNumberSubmit);
  }

  const users = await getUsersAsync(
    currentPageNumber,
    searchTerm,
    chapterIdValue,
    includeAllUsers,
  );

  return json({
    count,
    currentPageNumber,
    users: users.map((user) => ({
      ...user,
      checksCompleted: getNumberCompletedChecks(user),
    })),
    searchTerm,
  });
}

export default function SelectChapter() {
  const { chapters, users, count } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const formRef = useRef<HTMLFormElement | null>(null);

  const totalPageCount = Math.ceil((actionData?.count ?? count) / 10);
  const currentPageNumber = actionData?.currentPageNumber ?? 0;

  const pageUsers = actionData?.users ?? users;

  const onFormSubmit = () => formRef.current!.reset();

  return (
    <>
      <div className="flex items-center">
        <Title>Mentors</Title>

        <div className="flex-1"></div>

        <ActionsDropdown />
      </div>

      <hr className="my-4" />

      <Form ref={formRef} method="post">
        <FormInputs chapters={chapters} onFormSubmit={onFormSubmit} />

        <div className="overflow-auto">
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
              {pageUsers.length === 0 && (
                <tr>
                  <td className="border p-2" colSpan={6}>
                    <i>No users</i>
                  </td>
                </tr>
              )}
              {pageUsers.map(
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
                          to={id.toString()}
                          className="btn btn-success btn-xs w-full gap-2"
                        >
                          <PageEdit className="h-4 w-4" />
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
