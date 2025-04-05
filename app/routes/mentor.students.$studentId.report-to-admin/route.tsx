import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { Form, useActionData, useLoaderData } from "react-router";
import invariant from "tiny-invariant";

import { SubmitFormButton, SubTitle, Textarea, Title } from "~/components";

import { getStudentAsync, getUserByAzureADIdAsync } from "./services.server";
import { getLoggedUserInfoAsync } from "~/services/.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.studentId, "studentId not found");

  const student = await getStudentAsync(Number(params.studentId));

  return {
    student,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.studentId, "studentId not found");

  const REPORT_TO_ADMIN_LOGIC_APP_URL =
    process.env.REPORT_TO_ADMIN_LOGIC_APP_URL!;

  const loggedUser = await getLoggedUserInfoAsync(request);
  const mentor = await getUserByAzureADIdAsync(loggedUser.oid);

  const formData = await request.formData();

  const message = formData.get("message")!.toString();

  const student = await getStudentAsync(Number(params.studentId));

  const reponse = await fetch(REPORT_TO_ADMIN_LOGIC_APP_URL, {
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

  if (!reponse.ok) {
    throw new Error("Failed to send report to admin.");
  }

  return {
    message: "Successfully sent message. Thank you.",
  };
}

export default function Index() {
  const { student } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <>
      <Title>Report to Admin</Title>

      <Form method="post">
        <SubTitle>Student: {student.fullName}</SubTitle>

        <Textarea name="message" placeholder="Message" required />

        <SubmitFormButton
          className="mt-4 justify-between"
          successMessage={actionData?.message}
        />
      </Form>
    </>
  );
}
