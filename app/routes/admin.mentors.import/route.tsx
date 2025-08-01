import type { Route } from "./+types/route";

import { parseFormData } from "@mjackson/form-data-parser";
import { Form } from "react-router";

import {
  memoryHandlerDispose,
  trackException,
  uploadHandler,
} from "~/services/.server";
import { isEmail, isStringNullOrEmpty } from "~/services";

import { Import, PageEdit, Archive } from "iconoir-react";

import { Title, SubTitle, FileInput, StateLink } from "~/components";

import {
  readExcelFileAsync,
  getCurrentMentorsAsync,
  importSpreadsheetMentorsAsync,
} from "./services.server";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await parseFormData(request, uploadHandler);

  const file = formData.get("usersSheet");
  if (file === null || !(file instanceof File)) {
    return {
      newUsers: [],
      message: "Choose a file",
    };
  }

  const fileUsers = await readExcelFileAsync(file);

  memoryHandlerDispose("usersSheet");

  if (fileUsers.length === 0) {
    return {
      newUsers: [],
      message: "Nothing to import",
    };
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
    return {
      newUsers: [],
      message: `Incorrect emails: \n- ${incorrectEmails.join("\n- ")}`,
    };
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

    return {
      newUsers: users,
      message: null,
    };
  } catch (e: unknown) {
    console.error(e);

    const message = (e as Error).message;

    trackException(new Error(message));

    return {
      newUsers: [],
      message,
    };
  }
};

export default function Index({ actionData }: Route.ComponentProps) {
  return (
    <>
      <Title>Import mentors from file</Title>

      <hr className="my-4" />

      <Form
        method="post"
        encType="multipart/form-data"
        className="relative flex h-full flex-col gap-4"
      >
        <fieldset className="fieldset">
          <FileInput
            label="Upload a spreadsheet with new users"
            name="usersSheet"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          />

          <div className="mt-4 flex items-center justify-between">
            <button type="submit" className="btn btn-primary gap-2">
              <Import className="h-6 w-6" />
              Import
            </button>

            <StateLink to="/admin/mentors/import-history" className="btn gap-2">
              <Archive className="h-4 w-4" />
              View history
            </StateLink>
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
                    <td colSpan={3}>
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
                      <td>{index + 1}</td>
                      <td>
                        {firstName} {lastName}
                      </td>
                      <td>{importedHistory?.error}</td>
                      <td>
                        <StateLink
                          to={`/admin/mentors/${id.toString()}`}
                          className="btn btn-success btn-xs w-full gap-2"
                        >
                          <PageEdit className="h-4 w-4" />
                          Edit
                        </StateLink>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </fieldset>
      </Form>
    </>
  );
}
