import type { ActionFunctionArgs } from "react-router";

import { parseFormData } from "@mjackson/form-data-parser";
import { Form, useActionData, useNavigation } from "react-router";
import { Import, PageEdit, Archive } from "iconoir-react";

import { trackException } from "~/services/.server";
import { isValidDate } from "~/services";
import { Title, SubTitle, FileInput, StateLink } from "~/components";

import {
  readExcelFileAsync,
  getCurrentStudentsAsync,
  importSpreadsheetStudentsAsync,
  uploadHandler,
} from "./services.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await parseFormData(request, uploadHandler);

  const file = formData.get("studentsSheet");
  if (file === null || !(file instanceof File)) {
    return {
      newStudents: [],
      message: "Choose a file",
    };
  }

  const fileStudents = await readExcelFileAsync(file);

  if (fileStudents.length === 0) {
    return {
      newStudents: [],
      message: "Nothing to import",
    };
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
    return {
      newStudents: [],
      message: `Incorrect date of birth: \n- ${incorrectDateOfBirth.join(
        "\n- ",
      )}`,
    };
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

    return {
      newStudents: students,
      message: null,
    };
  } catch (e: unknown) {
    console.error(e);

    const message = (e as Error).message;

    trackException(new Error(message));

    return {
      newStudents: [],
      message,
    };
  }
};

export default function Index() {
  const actionData = useActionData<typeof action>();
  const transition = useNavigation();

  return (
    <>
      <Title>Import students from file</Title>

      <hr className="my-4" />

      <Form
        method="post"
        encType="multipart/form-data"
        className="relative flex h-full flex-col gap-4"
      >
        <fieldset
          className="fieldset"
          disabled={transition.state === "submitting"}
        >
          <FileInput
            label="Upload a spreadsheet with new students"
            name="studentsSheet"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          />

          <div className="mt-4 flex items-center justify-between">
            <button type="submit" className="btn btn-primary gap-2">
              <Import className="h-6 w-6" />
              Import
            </button>

            <StateLink
              to="/admin/students/import-history"
              className="btn gap-2"
            >
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
                    <td colSpan={3}>
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
                      <td>{index + 1}</td>
                      <td>
                        {firstName} {lastName}
                      </td>
                      <td>{importedStudentHistory?.error}</td>
                      <td>
                        <StateLink
                          to={`/admin/students/${id.toString()}`}
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
