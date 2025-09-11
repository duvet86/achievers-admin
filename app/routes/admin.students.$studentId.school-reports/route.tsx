import type { Route } from "./+types/route";

import { useSubmit } from "react-router";
import invariant from "tiny-invariant";
import { MaxFileSizeExceededError } from "@mjackson/form-data-parser";
import { EditPencil, Plus, Xmark } from "iconoir-react";

import { StateLink, Title } from "~/components";

import {
  deleteFileAsync,
  deleteSchoolReportAsync,
  getStudentInfoAsync,
  getSchoolReportsAsync,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.studentId, "studentId not found");

  const [student, schoolReports] = await Promise.all([
    getStudentInfoAsync(Number(params.studentId)),
    getSchoolReportsAsync(Number(params.studentId)),
  ]);

  return {
    student,
    schoolReports,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.studentId, "studentId not found");

  try {
    const formData = await request.formData();

    const reportId = formData.get("reportId")!.toString();
    const fileName = formData.get("fileName")!.toString();

    await deleteFileAsync(params.studentId, fileName);

    await deleteSchoolReportAsync(Number(reportId));
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

  return {
    successMessage: "Success",
    errorMessage: null,
  };
}

export default function Index({
  loaderData: { student, schoolReports },
}: Route.ComponentProps) {
  const submit = useSubmit();

  const deleteReport = (reportId: number, fileName: string) => () => {
    if (!confirm("Are you sure?")) {
      return;
    }

    void submit(
      {
        reportId,
        fileName,
      },
      {
        method: "POST",
      },
    );
  };

  return (
    <>
      <Title>School reports for &quot;{student.fullName}&quot;</Title>

      <StateLink to="new" className="btn btn-primary my-6 w-36">
        <Plus /> Add report
      </StateLink>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Label</th>
              <th>Term</th>
              <th align="right">Action</th>
            </tr>
          </thead>
          <tbody>
            {schoolReports.length === 0 && (
              <tr>
                <td colSpan={3} className="italic">
                  No reports uploaded
                </td>
              </tr>
            )}
            {schoolReports.map(
              ({ id, label, fileName, filePath, schoolTermLabel }, n) => (
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
                      {label}
                    </a>
                  </td>
                  <td>{schoolTermLabel}</td>
                  <td>
                    <div className="flex w-full justify-end gap-2">
                      <StateLink
                        className="btn btn-warning btn-xs w-20 gap-2"
                        to={id.toString()}
                      >
                        <EditPencil className="h-4 w-4" />
                        Edit
                      </StateLink>
                      <button
                        className="btn btn-error btn-xs w-20 gap-2"
                        type="button"
                        onClick={deleteReport(id, fileName)}
                      >
                        <Xmark className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
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
