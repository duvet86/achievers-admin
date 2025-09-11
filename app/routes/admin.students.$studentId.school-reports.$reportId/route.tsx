import type { Route } from "./+types/route";
import type { SchoolReportCreateCommand } from "./services.server";

import { Form, redirect } from "react-router";
import invariant from "tiny-invariant";
import {
  MaxFileSizeExceededError,
  parseFormData,
} from "@mjackson/form-data-parser";

import { getCurrentTermForDate } from "~/services";
import {
  getSchoolTermsAsync,
  memoryHandlerDispose,
  uploadHandler,
} from "~/services/.server";
import {
  FileInput,
  Input,
  Select,
  SubmitFormButton,
  Title,
} from "~/components";

import {
  getStudentInfoAsync,
  getSchoolReportAsync,
  saveFileAsync,
  saveSchoolReportAsync,
  updateSchoolReportAsync,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.studentId, "studentId not found");
  invariant(params.reportId, "reportId not found");

  const [student, terms] = await Promise.all([
    getStudentInfoAsync(Number(params.studentId)),
    getSchoolTermsAsync(),
  ]);

  const currentTerm = getCurrentTermForDate(terms, new Date());

  const termsOptions = [{ value: "", label: "Select a term" }].concat(
    terms.map(({ id, year, start, end, label }) => ({
      value: id.toString(),
      label: `${year} ${label} (${start.format("D MMMM")} - ${end.format("D MMMM")}) ${currentTerm.id === id ? " (Current)" : ""}`,
    })),
  );

  if (params.reportId.toUpperCase() === "NEW") {
    return {
      student,
      schoolReport: null,
      termsOptions,
    };
  }

  const schoolReport = await getSchoolReportAsync(Number(params.reportId));

  return {
    student,
    schoolReport,
    termsOptions,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.studentId, "studentId not found");
  invariant(params.reportId, "reportId not found");

  if (params.reportId.toUpperCase() !== "NEW") {
    const formData = await request.formData();

    const label = formData.get("label")!.toString();
    const selectedTermId = formData.get("selectedTermId")!.toString();

    const schoolReport = await updateSchoolReportAsync(
      Number(params.reportId),
      {
        label,
        schoolTermId: Number(selectedTermId),
      },
    );

    return redirect(
      `/admin/students/${params.studentId}/school-reports/${schoolReport.id}`,
    );
  }

  try {
    const formData = await parseFormData(
      request,
      { maxFileSize: 10 * 1024 * 1024 },
      uploadHandler,
    );

    const label = formData.get("label");
    const file = formData.get("file") as File;
    const selectedTermId = formData.get("selectedTermId")?.toString();

    if (selectedTermId === undefined) {
      return {
        successMessage: null,
        errorMessage: "Missing required fields",
      };
    }

    const data: SchoolReportCreateCommand = {
      schoolTermId: Number(selectedTermId),
      label: label!.toString(),
      filePath: await saveFileAsync(params.studentId, file),
    };

    const schoolReport = await saveSchoolReportAsync(
      Number(params.studentId),
      data,
    );

    memoryHandlerDispose("file");

    return redirect(
      `/admin/students/${params.studentId}/school-reports/${schoolReport.id}`,
    );
  } catch (e: unknown) {
    if (e instanceof MaxFileSizeExceededError) {
      return {
        successMessage: null,
        errorMessage: e.message,
      };
    }

    return {
      successMessage: null,
      errorMessage: (e as Error).message,
    };
  }
}

export default function Index({
  loaderData: { student, termsOptions, schoolReport },
  actionData,
}: Route.ComponentProps) {
  return (
    <>
      <Title>School reports for &quot;{student.fullName}&quot;</Title>

      <hr className="my-4" />

      <Form method="POST" encType="multipart/form-data">
        <fieldset className="fieldset p-4">
          <Select
            label="Term"
            name="selectedTermId"
            defaultValue={schoolReport?.schoolTerm.id}
            options={termsOptions}
            required
          />

          <Input
            label="Label"
            name="label"
            defaultValue={schoolReport?.label}
            required
          />

          {schoolReport === null ? (
            <FileInput
              label="Upload a school report (.pdf/.png/.jpeg supported)"
              name="file"
              accept="application/pdf, image/png, image/jpeg"
              required
            />
          ) : (
            <div>
              <label className="fieldset-label">School report</label>
              <a
                className="link"
                href={schoolReport.filePath}
                target="_blank"
                rel="noreferrer"
                download
              >
                {schoolReport.label}
              </a>
            </div>
          )}

          <SubmitFormButton
            successMessage={actionData?.successMessage}
            errorMessage={actionData?.errorMessage}
            className="mt-2 justify-between"
          />
        </fieldset>
      </Form>
    </>
  );
}
