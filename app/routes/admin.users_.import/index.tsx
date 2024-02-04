import type { ActionFunctionArgs, TypedResponse } from "@remix-run/node";
import type { UserHistory } from "./services.server";

import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  json,
} from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";

import { isEmail, isStringNullOrEmpty, trackException } from "~/services";

import { Import, PageEdit, Archive } from "iconoir-react";

import { Title, BackHeader, SubTitle } from "~/components";

import {
  readExcelFileAsync,
  getCurrentMentorsAsync,
  importSpreadsheetMentorsAsync,
} from "./services.server";

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<
  TypedResponse<{
    newUsers: UserHistory[];
    message: null | string;
  }>
> => {
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 500_000,
  });

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler,
  );

  const file = formData.get("usersSheet");
  if (file === null || !(file instanceof File)) {
    return json({
      newUsers: [],
      message: "Choose a file",
    });
  }

  const fileUsers = await readExcelFileAsync(file);

  if (fileUsers.length === 0) {
    return json({
      newUsers: [],
      message: "Nothing to import",
    });
  }

  const currentMentors = await getCurrentMentorsAsync();

  const incorrectEmails = fileUsers.reduce<string[]>((res, fileUser, index) => {
    if (
      isStringNullOrEmpty(fileUser["Email address"]) ||
      !isEmail(fileUser["Email address"])
    ) {
      res.push(`row number: ${index + 1}, email: ${fileUser["Email address"]}`);
    }
    return res;
  }, []);

  if (incorrectEmails.length > 0) {
    return json({
      newUsers: [],
      message: `Incorrect emails: \n- ${incorrectEmails.join("\n- ")}`,
    });
  }

  const existingMentorsLookup = currentMentors.reduce<Record<string, string>>(
    (res, { email }) => {
      res[email.toLowerCase()] = email.toLowerCase();

      return res;
    },
    {},
  );

  const newUsers = fileUsers.filter(
    (fileUser) =>
      existingMentorsLookup[fileUser["Email address"].toLowerCase()] ===
      undefined,
  );

  try {
    const users = await importSpreadsheetMentorsAsync(newUsers);

    return json({
      newUsers: users,
      message: null,
    });
  } catch (e: any) {
    console.error(e);

    trackException({
      exception: new Error(e.message),
    });

    return json({
      newUsers: [],
      message: e.message,
    });
  }
};

export default function Index() {
  const actionData = useActionData<typeof action>();
  const transition = useNavigation();

  const isLoading = transition.state === "loading";
  const isSubmitting = transition.state === "submitting";

  const isDisabled = isLoading || isSubmitting;

  return (
    <>
      <BackHeader to="/admin/users" />

      <Title>Import from file</Title>

      <Form
        method="post"
        encType="multipart/form-data"
        className="relative flex h-full flex-col gap-4"
      >
        <div className="form-control w-full max-w-xs">
          <label htmlFor="usersSheet" className="label">
            <span className="label-text">
              Upload a spreadsheet with new users
            </span>
          </label>
          <input
            type="file"
            id="usersSheet"
            name="usersSheet"
            className="file-input file-input-bordered w-full"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            disabled={isDisabled}
          />
        </div>

        <div className="flex items-center gap-20">
          <button
            type="submit"
            className="btn btn-primary gap-2"
            disabled={isDisabled}
          >
            <Import className="h-6 w-6" />
            Import
          </button>

          <Link to="/admin/users/import-history" className="btn gap-2">
            <Archive className="h-4 w-4" />
            View history
          </Link>
        </div>

        {actionData?.message && (
          <div className="card bg-error">
            <div className="card-body">
              <h2 className="card-title">Error!</h2>
              <pre className="whitespace-pre-wrap">{actionData.message}</pre>
            </div>
          </div>
        )}

        {!actionData?.message && actionData?.newUsers.length === 0 && (
          <div className="text-info">
            <p>No new users to import.</p>
          </div>
        )}

        <SubTitle>Imported mentors</SubTitle>

        <div className="overflow-auto bg-white">
          <table className="table">
            <thead>
              <tr>
                <th align="left" className="w-12">
                  #
                </th>
                <th align="left">Full name</th>
                <th align="left">Errors</th>
                <th align="right">Action</th>
              </tr>
            </thead>
            <tbody>
              {actionData?.newUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className="border">
                    <i>No mentors imported</i>
                  </td>
                </tr>
              )}
              {actionData?.newUsers.map(
                ({ id, firstName, lastName, importedHistory }, index) => (
                  <tr
                    key={id}
                    className={
                      importedHistory?.error !== null ? "bg-error" : undefined
                    }
                  >
                    <td className="border">{index + 1}</td>
                    <td className="border">
                      {firstName} {lastName}
                    </td>
                    <td className="border">{importedHistory?.error}</td>
                    <td className="border">
                      <Link
                        to={`/admin/users/${id.toString()}`}
                        className="btn btn-success btn-xs w-full gap-2"
                      >
                        <PageEdit className="h-4 w-4" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </Form>
    </>
  );
}
