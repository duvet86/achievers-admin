import type { Route } from "./+types/route";

import invariant from "tiny-invariant";
import dayjs from "dayjs";

import { Textarea, Title } from "~/components";

import { getStudentByIdAsync } from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.studentId, "studentId not found");

  const student = await getStudentByIdAsync(Number(params.studentId));

  return {
    ...student,
    endDate: dayjs(student.endDate).format("DD/MM/YYYY"),
  };
}

export default function Index({
  loaderData: { fullName, endDate, studentNotes },
}: Route.ComponentProps) {
  return (
    <>
      <Title>Archived Student</Title>

      <p className="mt-4">
        Student: <span className="font-bold">{fullName}</span>
      </p>

      <p className="mt-4">
        Archived on: <span className="font-bold">{endDate}</span>
      </p>

      <p className="my-4">Reason:</p>

      {studentNotes.length > 0 && (
        <Textarea defaultValue={studentNotes[0].note} readOnly disabled />
      )}
    </>
  );
}
