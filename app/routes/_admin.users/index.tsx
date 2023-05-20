import type { ActionArgs } from "@remix-run/node";

import { useLoaderData, Link, Form, useActionData } from "@remix-run/react";
import { json } from "@remix-run/node";

import { useRef } from "react";

import {
  Import,
  PageEdit,
  FastArrowLeft,
  FastArrowRight,
  WarningTriangle,
} from "iconoir-react";

import { Input, Title } from "~/components";

import { getUsersAsync, getUsersCountAsync } from "./services.server";

function getNumberCompletedChecks(user: any): number {
  let checks = 1;
  if (user.welcomeCall !== null) {
    checks++;
  }
  if (
    user.references.filter((ref: any) => ref.calledOndate !== null).length >= 2
  ) {
    checks++;
  }
  if (user.induction !== null) {
    checks++;
  }
  if (user.policeCheck !== null) {
    checks++;
  }
  if (user.wwcCheck !== null) {
    checks++;
  }
  if (user.approvalbyMRC !== null) {
    checks++;
  }
  if (user.volunteerAgreementSignedOn !== null) {
    checks++;
  }

  return checks;
}

export async function loader() {
  const [count, users] = await Promise.all([
    getUsersCountAsync(),
    getUsersAsync(0),
  ]);

  return json({
    count,
    users: users.map((user) => ({
      ...user,
      checksCompleted: getNumberCompletedChecks(user),
    })),
  });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const searchTermSubmit = formData.get("searchBtn")?.toString();
  const clearSearchSubmit = formData.get("clearSearchBtn")?.toString();
  const previousPageSubmit = formData.get("previousBtn")?.toString();
  const pageNumberSubmit = formData.get("pageNumberBtn")?.toString();
  const nextPageSubmit = formData.get("nextBtn")?.toString();

  let searchTerm = formData.get("searchTerm")?.toString();
  const pageNumber = Number(formData.get("pageNumber")!.toString());
  const includeAllUsers = formData.get("allUsers")?.toString() === "on";

  const count = await getUsersCountAsync();
  const totalPageCount = Math.ceil(count / 10);

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
    includeAllUsers
  );

  return json({
    currentPageNumber,
    users: users.map((user) => ({
      ...user,
      checksCompleted: getNumberCompletedChecks(user),
    })),
    searchTerm,
  });
}

export default function SelectChapter() {
  const { users, count } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const formRef = useRef<HTMLFormElement | null>(null);

  const totalPageCount = Math.ceil(count / 10);
  const currentPageNumber = actionData?.currentPageNumber ?? 0;

  const pageUsers = actionData?.users ?? users;

  return (
    <>
      <Title>Mentors</Title>

      <p className="mb-8 flex items-center gap-2">
        <WarningTriangle className="h-6 w-6 text-warning" />
        Only mentors with incomplete checks are displayed. Toggle the "Include
        all mentors" to include all of them.
      </p>

      <Form ref={formRef} method="post">
        <div className="mb-6 flex gap-6 align-middle">
          <div className="w-96">
            <Input name="searchTerm" placeholder="Search" />
          </div>

          <div className="form-control">
            <label className="label cursor-pointer gap-6">
              <span className="label-text">Include all mentors</span>
              <input
                type="checkbox"
                name="allUsers"
                className="checkbox-primary checkbox"
              />
            </label>
          </div>

          <button
            className="btn-primary btn w-32"
            type="submit"
            name="searchBtn"
            value="searchBtn"
          >
            Submit
          </button>
          <button
            className="btn w-32"
            type="submit"
            name="clearSearchBtn"
            value="clearSearchBtn"
            onClick={() => formRef.current!.reset()}
          >
            Clear
          </button>
        </div>

        <div className="h-96 overflow-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th align="left" className="p-2">
                  Full Name
                </th>
                <th align="left" className="p-2">
                  Email
                </th>
                <th align="left" className="p-2">
                  Assigned Chapter
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
                  <td className="border p-2" colSpan={5}>
                    <i>No users</i>
                  </td>
                </tr>
              )}
              {pageUsers.map(
                ({
                  id,
                  firstName,
                  lastName,
                  email,
                  userAtChapter,
                  checksCompleted,
                }) => (
                  <tr key={id}>
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
                        className="btn-success btn-xs btn w-full gap-2"
                      >
                        <PageEdit className="h-4 w-4" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <input type="hidden" name="pageNumber" value={currentPageNumber} />

        <div className="btn-group mt-4">
          <button
            name="previousBtn"
            value="previousBtn"
            className="btn-outline btn"
            disabled={currentPageNumber === 0}
          >
            <FastArrowLeft />
          </button>
          {Array(totalPageCount)
            .fill(null)
            .map((_, index) => (
              <button
                key={index}
                name="pageNumberBtn"
                value={index}
                className={
                  currentPageNumber === index
                    ? "btn-outline btn-active btn "
                    : "btn-outline btn"
                }
              >
                {index + 1}
              </button>
            ))}
          <button
            name="nextBtn"
            value="nextBtn"
            className="btn-outline btn"
            disabled={
              currentPageNumber === totalPageCount - 1 || totalPageCount === 0
            }
          >
            <FastArrowRight />
          </button>
        </div>
      </Form>

      <div className="mt-10 flex justify-end">
        <Link className="btn-primary btn w-96 gap-2" to="import">
          <Import className="h-6 w-6" />
          Import mentors from file
        </Link>
      </div>
    </>
  );
}
