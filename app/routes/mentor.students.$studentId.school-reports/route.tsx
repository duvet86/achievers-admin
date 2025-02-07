import type { LoaderFunctionArgs } from "react-router";

import { useLoaderData } from "react-router";
import invariant from "tiny-invariant";

import { Title } from "~/components";

import {
  getSchoolReportsForStudentIdAsync,
  getStudentByIdAsync,
} from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.studentId, "studentId not found");

  const student = await getStudentByIdAsync(Number(params.studentId));
  const report = await getSchoolReportsForStudentIdAsync(student.id);

  return {
    student,
    report,
  };
}

export default function Index() {
  const { student, report } = useLoaderData<typeof loader>();

  return (
    <>
      <Title to="/mentor/students">
        School reports for &quot;{student.fullName}&quot;
      </Title>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>School term</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {report.length === 0 && (
              <tr>
                <td colSpan={3} className="italic">
                  No reports uploaded
                </td>
              </tr>
            )}
            {report.map(({ id, fileName, filePath, schoolTerm }, n) => (
              <tr key={id}>
                <th className="w-16">{n + 1}</th>
                <td>
                  {schoolTerm.startDate} - {schoolTerm.endDate}
                </td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
