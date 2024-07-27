import type { ActionFunctionArgs, TypedResponse } from "@remix-run/node";
import type { StudentHistory } from "./services.server";

import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  json,
} from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { Import, PageEdit, Archive } from "iconoir-react";

import { trackException } from "~/services/.server";
import { isValidDate } from "~/services";
import { Title, SubTitle } from "~/components";

import {
  readExcelFileAsync,
  getCurrentStudentsAsync,
  importSpreadsheetStudentsAsync,
} from "./services.server";

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<
  TypedResponse<{
    newStudents: StudentHistory[];
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

  const file = formData.get("studentsSheet");
  if (file === null || !(file instanceof File)) {
    return json({
      newStudents: [],
      message: "Choose a file",
    });
  }

  const fileStudents = await readExcelFileAsync(file);

  if (fileStudents.length === 0) {
    return json({
      newStudents: [],
      message: "Nothing to import",
    });
  }

  const currentStudents = await getCurrentStudentsAsync();

  const incorrectDateOfBirth = fileStudents.reduce<string[]>(
    (res, fileStudent, index) => {
      if (!isValidDate(fileStudent["Date of Birth"])) {
        res.push(
          `row number ${index + 1}: date of birth is incorrect: ${fileStudent[
            "Date of Birth"
          ]?.toString()}`,
        );
      }
      return res;
    },
    [],
  );

  if (incorrectDateOfBirth.length > 0) {
    return json({
      newStudents: [],
      message: `Incorrect date of birth: \n- ${incorrectDateOfBirth.join(
        "\n- ",
      )}`,
    });
  }

  const existingStudentsLookup = currentStudents.reduce<
    Record<string, boolean>
  >((res, { firstName, lastName }) => {
    res[firstName.toLowerCase() + lastName.toLowerCase()] = true;

    return res;
  }, {});

  const newStudents = fileStudents.filter(
    (fileStudent) =>
      existingStudentsLookup[
        fileStudent["First Name"].toLowerCase() +
          fileStudent["Last Name"].toLowerCase()
      ] === undefined,
  );

  try {
    const students = await importSpreadsheetStudentsAsync(newStudents);

    return json({
      newStudents: students,
      message: null,
    });
  } catch (e: unknown) {
    console.error(e);

    const message = (e as Error).message;

    trackException(new Error(message));

    return json({
      newStudents: [],
      message,
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
      <Title>Import from file</Title>

      <Form
        method="post"
        encType="multipart/form-data"
        className="relative flex h-full flex-col gap-4"
      >
        <div className="form-control w-full max-w-xs">
          <label htmlFor="studentsSheet" className="label">
            <span className="label-text">
              Upload a spreadsheet with new students
            </span>
          </label>
          <input
            type="file"
            id="studentsSheet"
            name="studentsSheet"
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

          <Link to="/admin/students/import-history" className="btn gap-2">
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

        {!actionData?.message && actionData?.newStudents.length === 0 && (
          <div className="text-info">
            <p>No new students to import.</p>
          </div>
        )}

        <SubTitle>Imported students</SubTitle>

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
              {actionData?.newStudents.length === 0 && (
                <tr>
                  <td colSpan={3} className="border">
                    <i>No students imported</i>
                  </td>
                </tr>
              )}
              {actionData?.newStudents.map(
                (
                  { id, firstName, lastName, importedStudentHistory },
                  index,
                ) => (
                  <tr
                    key={id}
                    className={
                      importedStudentHistory?.error !== null
                        ? "bg-error"
                        : undefined
                    }
                  >
                    <td className="border">{index + 1}</td>
                    <td className="border">
                      {firstName} {lastName}
                    </td>
                    <td className="border">{importedStudentHistory?.error}</td>
                    <td className="border">
                      <Link
                        to={`/admin/students/${id.toString()}`}
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
