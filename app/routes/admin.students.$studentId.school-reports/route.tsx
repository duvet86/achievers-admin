import type { Route } from "./+types/route";
import type { SchoolReportCommand } from "./services.server";

import { Form, useSubmit } from "react-router";
import invariant from "tiny-invariant";
import { parseFormData } from "@mjackson/form-data-parser";
import { Xmark } from "iconoir-react";

import { getCurrentTermForDate } from "~/services";
import { getSchoolTermsAsync } from "~/services/.server";
import { FileInput, Select, SubmitFormButton, Title } from "~/components";

import {
  deleteFileAsync,
  deleteSchoolReportAsync,
  getStudentByIdAsync,
  saveFileAsync,
  saveSchoolReportAsync,
  uploadHandler,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.studentId, "studentId not found");

  const student = await getStudentByIdAsync(Number(params.studentId));

  const terms = await getSchoolTermsAsync();
  const todayterm = getCurrentTermForDate(terms, new Date());

  return {
    termsList: terms.map(({ id, start, end, name }) => ({
      value: id.toString(),
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")})${todayterm.name === name ? " (Current)" : ""}`,
    })),
    selectedTermId: todayterm.id.toString(),
    student,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.studentId, "studentId not found");

  try {
    if (request.method === "DELETE") {
      const formData = await request.formData();

      const reportId = formData.get("reportId")!.toString();
      const fileName = formData.get("fileName")!.toString();

      await deleteFileAsync(params.studentId, fileName);

      await deleteSchoolReportAsync(Number(reportId));
    } else {
      const formData = await parseFormData(request, uploadHandler);

      const file = formData.get("file") as File;
      const selectedTermId = formData.get("selectedTermId")?.toString();

      if (selectedTermId === undefined) {
        return {
          successMessage: null,
          errorMessage: "Missing required fields",
        };
      }

      const data: SchoolReportCommand = {
        schoolTermId: Number(selectedTermId),
        filePath: await saveFileAsync(params.studentId, file),
      };

      await saveSchoolReportAsync(Number(params.studentId), data);
    }
  } catch (e: unknown) {
    return {
      successMessage: null,
      errorMessage: (e as Error).message,
    };
  }

  return {
    successMessage: "Success",
    errorMessage: null,
  };
}

export default function Index({
  loaderData: { student, termsList, selectedTermId },
  actionData,
}: Route.ComponentProps) {
  const submit = useSubmit();

  const deleteReport = (reportId: number, fileName: string) => () => {
    void submit(
      {
        reportId,
        fileName,
      },
      {
        method: "DELETE",
      },
    );
  };

  return (
    <>
      <Title>School reports for &quot;{student.fullName}&quot;</Title>

      <hr className="my-4" />

      <Form method="post" encType="multipart/form-data">
        <fieldset className="fieldset">
          <Select
            label="Term"
            name="selectedTermId"
            defaultValue={selectedTermId}
            options={termsList}
          />

          <FileInput
            label="Upload a school report (.pdf/.png/.jpeg supported)"
            name="file"
            accept="application/pdf, image/png, image/jpeg"
          />

          <SubmitFormButton
            successMessage={actionData?.successMessage}
            errorMessage={actionData?.errorMessage}
            className="mt-6 justify-between"
          />
        </fieldset>
      </Form>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Term</th>
              <th align="right">Action</th>
            </tr>
          </thead>
          <tbody>
            {student.schoolReports.length === 0 && (
              <tr>
                <td colSpan={3} className="italic">
                  No reports uploaded
                </td>
              </tr>
            )}
            {student.schoolReports.map(
              ({ id, fileName, filePath, schoolTermLabel }, n) => (
                <tr key={id}>
                  <th>{n + 1}</th>
                  <td>
                    <a
                      className="link"
                      href={filePath}
                      target="_blank"
                      rel="noreferrer"
                      download
                    >
                      {fileName}
                    </a>
                  </td>
                  <td>{schoolTermLabel}</td>
                  <td>
                    <button
                      className="btn btn-error btn-xs w-full gap-2"
                      type="button"
                      onClick={deleteReport(id, fileName)}
                    >
                      <Xmark className="h-4 w-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
