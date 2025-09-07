import type { Route } from "./+types/route";

import { Form, useFetcher } from "react-router";
import invariant from "tiny-invariant";
import { WarningCircle, Xmark } from "iconoir-react";

import { getPaginationRange, URLSafeSearch } from "~/services";
import { Pagination, Select, Title } from "~/components";

import {
  createStudentGradeAsync,
  deleteStudentGradeAsync,
  getGradeAsync,
  getStudentByIdAsync,
  getStudentGradesAsync,
  getStudentGradesCountAsync,
  GRADES,
  SEMESTERS,
  SUBJECTS,
  YEARS,
} from "./services.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  invariant(params.studentId, "studentId not found");

  const url = new URLSafeSearch(request.url);

  const previousPageSubmit = url.safeSearchParams.getNullOrEmpty("previousBtn");
  const pageNumberSubmit = url.safeSearchParams.getNullOrEmpty("pageNumberBtn");
  const nextPageSubmit = url.safeSearchParams.getNullOrEmpty("nextBtn");

  const pageNumber = Number(url.safeSearchParams.getNullOrEmpty("pageNumber")!);

  const year = url.safeSearchParams.getNullOrEmpty("year");
  const semester = url.safeSearchParams.getNullOrEmpty("semester");
  const subject = url.safeSearchParams.getNullOrEmpty("subject");

  const count = await getStudentGradesCountAsync(
    Number(params.studentId),
    year ? Number(year) : null,
    semester,
    subject,
  );

  const numberItems = 10;
  const totalPageCount = Math.ceil(count / numberItems);

  let currentPageNumber = 0;
  if (previousPageSubmit !== null && pageNumber > 0) {
    currentPageNumber = pageNumber - 1;
  } else if (nextPageSubmit !== null && pageNumber < totalPageCount) {
    currentPageNumber = pageNumber + 1;
  } else if (pageNumberSubmit !== null) {
    currentPageNumber = Number(pageNumberSubmit);
  }

  const [student, grades] = await Promise.all([
    getStudentByIdAsync(Number(params.studentId)),
    getStudentGradesAsync(
      Number(params.studentId),
      currentPageNumber,
      year ? Number(year) : null,
      semester,
      subject,
    ),
  ]);

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  return {
    currentPageNumber,
    range,
    count,
    student,
    grades,
    yearOptions: [{ label: "Select a year", value: "" }].concat(
      YEARS.map((year) => ({
        label: year.toString(),
        value: year.toString(),
      })),
    ),
    semesterOptions: Object.keys(SEMESTERS).reduce<
      { label: string; value: string }[]
    >(
      (acc, key) => {
        acc.push({
          label: SEMESTERS[key],
          value: key,
        });
        return acc;
      },
      [{ label: "Select a semester", value: "" }],
    ),
    subjectOptions: Object.keys(SUBJECTS).reduce<
      { label: string; value: string }[]
    >(
      (acc, key) => {
        acc.push({
          label: SUBJECTS[key],
          value: key,
        });
        return acc;
      },
      [{ label: "Select a subject", value: "" }],
    ),
    gardeOptions: [{ label: "Select a grade", value: "" }].concat(
      GRADES.map((grade) => ({
        label: grade,
        value: grade,
      })),
    ),
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.studentId, "studentId not found");

  const formData = await request.formData();

  if (request.method === "DELETE") {
    const gradeId = formData.get("gradeId");
    if (gradeId === null) {
      throw new Error("Missingg gradeId.");
    }

    await deleteStudentGradeAsync(Number(gradeId));

    return null;
  }

  const year = formData.get("year");
  const semester = formData.get("semester");
  const subject = formData.get("subject");
  const grade = formData.get("grade");

  if (
    year === null ||
    semester === null ||
    subject === null ||
    grade === null
  ) {
    throw new Error("Missingg grade info.");
  }

  const gradeEntry = await getGradeAsync(
    Number(year),
    semester.toString(),
    subject.toString(),
  );

  if (gradeEntry !== null) {
    return {
      errorMessage: "Grade entry already exists.",
    };
  }

  await createStudentGradeAsync(Number(params.studentId), {
    year: Number(year),
    semester: semester.toString(),
    subject: subject.toString(),
    grade: grade.toString(),
  });

  return null;
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const {
    Form: FetcherForm,
    data,
    state,
    submit,
  } = useFetcher<typeof loader | typeof action>();

  const isLoading = state !== "idle";

  const errorMessage =
    data && "errorMessage" in data ? data.errorMessage : undefined;

  const {
    currentPageNumber,
    range,
    count,
    student,
    grades,
    yearOptions,
    semesterOptions,
    subjectOptions,
    gardeOptions,
  } = data && "currentPageNumber" in data ? data : loaderData;

  const totalPageCount = Math.ceil(count / 10);

  const deleteGrade = (gradeId: number) => () => {
    const formData = new FormData();
    formData.set("gradeId", gradeId.toString());

    void submit(formData, {
      method: "DELETE",
    });
  };

  return (
    <>
      <Title>Grades tracker for &quot;{student.fullName}&quot;</Title>

      <FetcherForm method="POST" className="relative my-4">
        {isLoading && (
          <div className="absolute z-10 flex h-full w-full justify-center">
            <span className="loading loading-spinner loading-xl text-primary"></span>
          </div>
        )}

        <fieldset
          disabled={isLoading}
          className="fieldset bg-base-200 border-base-300 rounded-box border p-4"
        >
          <legend className="fieldset-legend">Input grade details</legend>

          <Select label="Year" name="year" options={yearOptions} required />
          <Select
            label="Semester"
            name="semester"
            options={semesterOptions}
            required
          />
          <Select
            label="Subject"
            name="subject"
            options={subjectOptions}
            required
          />
          <Select label="Grade" name="grade" options={gardeOptions} required />

          <div className="mt-2 flex justify-between">
            <div>
              {errorMessage && (
                <div className="bg-error flex gap-4 rounded-lg p-2 pr-12">
                  <WarningCircle />
                  {errorMessage}
                </div>
              )}
            </div>

            <button className="btn btn-primary w-full sm:w-32" type="submit">
              Submit
            </button>
          </div>
        </fieldset>
      </FetcherForm>

      <Form>
        <div className="overflow-x-auto bg-white">
          <table className="table">
            <thead>
              <tr>
                <th align="left" className="hidden w-14 sm:table-cell">
                  #
                </th>
                <th>Year</th>
                <th>Semester</th>
                <th>Subject</th>
                <th>Grade</th>
                <th align="right" className="hidden sm:table-cell">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {grades.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <i>No grades yet</i>
                  </td>
                </tr>
              )}
              {grades.map(({ id, year, semester, subject, grade }, index) => (
                <tr key={id}>
                  <th>{index + 1 + 10 * currentPageNumber}</th>
                  <td>{year}</td>
                  <td>{semester}</td>
                  <td>{subject}</td>
                  <td>{grade}</td>
                  <td className="hidden sm:table-cell" align="right">
                    <button
                      className="btn btn-error btn-xs"
                      type="button"
                      onClick={deleteGrade(id)}
                    >
                      <Xmark />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <input type="hidden" name="pageNumber" value={currentPageNumber} />

        <Pagination
          range={range}
          currentPageNumber={currentPageNumber}
          totalPageCount={totalPageCount}
        />
      </Form>
    </>
  );
}
