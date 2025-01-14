import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { SchoolReportCommand } from "./services.server";

import {
  Form,
  useActionData,
  useLoaderData,
  useSearchParams,
} from "react-router";
import invariant from "tiny-invariant";
import { parseFormData } from "@mjackson/form-data-parser";

import { getCurrentTermForDate } from "~/services";
import { getSchoolTermsAsync } from "~/services/.server";
import { FileInput, Select, SubmitFormButton, Title } from "~/components";

import {
  getStudentByIdAsync,
  saveFileAsync,
  saveSchoolReportAsync,
  uploadHandler,
} from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.studentId, "studentId not found");

  const student = await getStudentByIdAsync(Number(params.studentId));

  const terms = await getSchoolTermsAsync();
  const todayterm = getCurrentTermForDate(terms, new Date());

  return {
    termsList: terms.map(({ start, end, name, id }) => ({
      value: id.toString(),
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")})${todayterm.name === name ? " (Current)" : ""}`,
    })),
    selectedTermId: todayterm.id.toString(),
    student,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.studentId, "studentId not found");

  try {
    const formData = await parseFormData(request, uploadHandler);

    const file = formData.get("file") as File;
    const selectedTermId = formData.get("selectedTermId")?.toString();

    if (selectedTermId === undefined) {
      return {
        errorMessage: "Missing required fields",
      };
    }

    const data: SchoolReportCommand = {
      schoolTermId: Number(selectedTermId),
      filePath: await saveFileAsync(params.studentId, file),
    };

    await saveSchoolReportAsync(Number(params.studentId), data);
  } catch (e: unknown) {
    return {
      errorMessage: (e as Error).message,
    };
  }

  return {
    errorMessage: null,
  };
}

export default function Index() {
  const { student, termsList, selectedTermId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();

  return (
    <>
      <Title to={`/admin/students/${student.id}?${searchParams.toString()}`}>
        School reports for &quot;{student.fullName}&quot;
      </Title>

      <Form method="post" encType="multipart/form-data">
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
          errorMessage={actionData?.errorMessage}
          className="mt-6 justify-between"
        />
      </Form>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Term</th>
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
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
