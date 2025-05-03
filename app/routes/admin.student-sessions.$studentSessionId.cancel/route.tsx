import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { BinFull } from "iconoir-react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";

import { Message, Textarea, Title } from "~/components";

import { cancelStudentSession, getStudentSession } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.studentSessionId, "studentSessionId not found");

  const studentSession = await getStudentSession(
    Number(params.studentSessionId),
  );

  if (studentSession.completedOn !== null) {
    throw redirect(`/admin/student-sessions/${params.studentSessionId}`);
  }

  return { studentSession };
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.studentSessionId, "studentSessionId not found");

  const formData = await request.formData();

  const cancelReason = formData.get("cancelReason")?.toString();

  if (cancelReason === undefined) {
    throw new Error();
  }

  await cancelStudentSession(Number(params.studentSessionId), cancelReason);

  return {
    successMessage: "Student session cancelled successfully",
  };
}

export default function Index() {
  const { studentSession } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const transition = useNavigation();

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Title>
          Cancel session of &quot;
          {dayjs(studentSession.session.attendedOn).format("MMMM D, YYYY")}
          &quot;
        </Title>

        <Message key={Date.now()} successMessage={actionData?.successMessage} />
      </div>

      <Form method="post">
        <fieldset disabled={transition.state === "submitting"}>
          <p className="my-4">
            Are you sure you want cancel the session between mentor &quot;
            {studentSession.session.mentor.fullName}&quot; and student &quot;
            {studentSession.student.fullName}&quot;?
          </p>

          <Textarea placeholder="Cancel reason" name="cancelReason" required />

          <div className="mt-6 flex items-center justify-end">
            <button className="btn btn-error w-44 gap-4" type="submit">
              <BinFull className="h-6 w-6" />
              Cancel
            </button>
          </div>
        </fieldset>
      </Form>
    </>
  );
}
