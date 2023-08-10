import type { ActionArgs } from "@remix-run/node";

import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  json,
} from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";

import { isEmail, isStringNullOrEmpty } from "~/services";

import { Import, PageEdit } from "iconoir-react";

import { LoadingSpinner, Title, BackHeader, SubTitle } from "~/components";

import {
  readExcelFileAsync,
  getCurrentMentorsAsync,
  importSpreadsheetMentorsAsync,
} from "./services.server";

export const action = async ({ request }: ActionArgs) => {
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
      <BackHeader />

      <Title>Import from file</Title>

      <Form
        method="post"
        encType="multipart/form-data"
        className="relative flex h-full flex-col gap-8"
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
            className="file-input-bordered file-input w-full"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            disabled={isDisabled}
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="btn-primary btn gap-2"
            disabled={isDisabled}
          >
            <Import className="h-6 w-6" />
            Import
          </button>
          {isDisabled && <LoadingSpinner dark />}
        </div>

        {actionData?.message && (
          <div className="card bg-error">
            <div className="card-body">
              <h2 className="card-title">Error!</h2>
              <pre className="whitespace-pre-wrap">{actionData.message}</pre>
            </div>
          </div>
        )}

        <div className="text-info">
          {!actionData?.message && actionData?.newUsers.length === 0 && (
            <p>No new users to import.</p>
          )}
        </div>

        <SubTitle>Imported mentors</SubTitle>

        <div className="overflow-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th align="left" className="w-12 p-2">
                  #
                </th>
                <th align="left" className="p-2">
                  Full Name
                </th>
                <th align="left" className="p-2">
                  Email
                </th>
                <th align="right" className="p-2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {!actionData && (
                <tr>
                  <td colSpan={3} className="border p-2">
                    <i>No mentors imported</i>
                  </td>
                </tr>
              )}
              {actionData?.newUsers.map(
                ({ id, firstName, lastName, email }, index) => (
                  <tr key={id}>
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">
                      {firstName} {lastName}
                    </td>
                    <td className="border p-2">{email}</td>
                    <td className="border p-2">
                      <Link
                        to={`/users/${id.toString()}`}
                        className="btn-success btn-xs btn w-full gap-2"
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
