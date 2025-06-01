import type { Route } from "./+types/route";

import { Form, redirect } from "react-router";
import { Check } from "iconoir-react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";

import { Textarea, Title } from "~/components";

import {
  getStudentByIdAsync,
  getStudentSessionByDateAsync,
  createStudentSessionAsync,
} from "./services.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentId, "studentId not found");
  invariant(params.attendedOn, "attendedOn not found");

  const selectedStudentId = Number(params.studentId);

  const studentSession = await getStudentSessionByDateAsync(
    Number(params.chapterId),
    selectedStudentId,
    params.attendedOn,
  );

  if (studentSession?.status === "UNAVAILABLE") {
    const url = new URL(request.url);

    return redirect(
      `/admin/chapters/${params.chapterId}/roster-students/student-sessions/${studentSession.id}?${url.searchParams}`,
    );
  }

  const student = await getStudentByIdAsync(Number(params.studentId));

  return {
    student,
    studentSession,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentId, "studentId not found");
  invariant(params.attendedOn, "attendedOn not found");

  const formData = await request.formData();

  const reason = formData.get("reason")?.toString();

  if (reason === undefined) {
    throw new Error();
  }

  const studentSession = await createStudentSessionAsync({
    chapterId: Number(params.chapterId),
    studentId: Number(params.studentId),
    attendedOn: params.attendedOn,
    reason,
  });

  return redirect(
    `/admin/chapters/${params.chapterId}/roster-students/student-sessions/${studentSession.id}`,
  );
}

export default function Index({
  params,
  loaderData: { student, studentSession },
}: Route.ComponentProps) {
  return (
    <>
      <Title>
        Mark student &quot;{student.fullName} &quot; as unavailable for session
        of &quot;
        {dayjs(params.attendedOn).format("MMMM D, YYYY")}
        &quot;
      </Title>

      <Form method="post">
        <fieldset>
          <p className="my-4">
            Are you sure you want to mark the student as unavailable?
          </p>

          <Textarea
            placeholder="Reason"
            name="reason"
            readOnly={studentSession?.status === "UNAVAILABLE"}
            disabled={studentSession?.status === "UNAVAILABLE"}
            defaultValue={studentSession?.reason ?? ""}
            required
          />

          {studentSession?.status !== "UNAVAILABLE" && (
            <div className="mt-6 flex items-center justify-end">
              <button className="btn btn-primary w-44 gap-4" type="submit">
                <Check className="h-6 w-6" />
                Save
              </button>
            </div>
          )}
        </fieldset>
      </Form>
    </>
  );
}
