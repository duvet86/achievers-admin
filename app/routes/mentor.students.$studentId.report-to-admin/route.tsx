import type { Route } from "./+types/route";

import { Form } from "react-router";
import invariant from "tiny-invariant";
import { SubmitDocument } from "iconoir-react";

import { getLoggedUserInfoAsync } from "~/services/.server";
import { getEnvironment } from "~/services";
import { Message, SubTitle, Textarea, Title } from "~/components";

import { getStudentAsync, getUserByAzureADIdAsync } from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.studentId, "studentId not found");

  const student = await getStudentAsync(Number(params.studentId));

  return {
    student,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.studentId, "studentId not found");

  const environment = getEnvironment(request);

  if (environment === "production") {
    const REPORT_TO_ADMIN_LOGIC_APP_URL =
      process.env.REPORT_TO_ADMIN_LOGIC_APP_URL!;

    const loggedUser = await getLoggedUserInfoAsync(request);
    const mentor = await getUserByAzureADIdAsync(loggedUser.oid);

    const formData = await request.formData();

    const message = formData.get("message")!.toString();

    const student = await getStudentAsync(Number(params.studentId));

    const response = await fetch(REPORT_TO_ADMIN_LOGIC_APP_URL, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mentorId: mentor.id,
        mentorName: mentor.fullName,
        studentId: student.id,
        studentName: student.fullName,
        message,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send report to admin.");
    }
  }

  return {
    message: "Your report was sent to admin@achieversclubwa.org.au",
  };
}

export default function Index({
  loaderData: { student },
  actionData,
}: Route.ComponentProps) {
  return (
    <>
      <Title>Report to Admin</Title>

      <Form method="post">
        <SubTitle>Student: {student.fullName}</SubTitle>

        <p className="mt-4 mb-1 text-sm text-gray-500">
          If you have any concerns about this student, please report it to the
          admin.
        </p>

        <Textarea name="message" required />

        <div className="mt-4 flex justify-between">
          <Message key={Date.now()} successMessage={actionData?.message} />

          <button className="btn btn-primary w-48" type="submit">
            <SubmitDocument />
            Submit
          </button>
        </div>
      </Form>
    </>
  );
}
