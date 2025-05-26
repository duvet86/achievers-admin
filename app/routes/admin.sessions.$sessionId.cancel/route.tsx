import type { Route } from "./+types/route";

import { Form, redirect } from "react-router";
import { BinFull } from "iconoir-react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";

import { Message, Textarea, Title } from "~/components";

import { cancelSession, getSession } from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.sessionId, "sessionId not found");

  const session = await getSession(Number(params.sessionId));

  if (session.completedOn !== null) {
    throw redirect(`/admin/sessions/${params.sessionId}`);
  }

  return { session };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.sessionId, "sessionId not found");

  const formData = await request.formData();

  const cancelReason = formData.get("cancelReason")?.toString();

  if (cancelReason === undefined) {
    throw new Error();
  }

  await cancelSession(Number(params.sessionId), cancelReason);

  return {
    successMessage: "Student session cancelled successfully",
  };
}

export default function Index({
  loaderData: { session },
  actionData,
}: Route.ComponentProps) {
  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Title>
          Cancel session of &quot;
          {dayjs(session.attendedOn).format("MMMM D, YYYY")}
          &quot;
        </Title>

        <Message key={Date.now()} successMessage={actionData?.successMessage} />
      </div>

      <Form method="post">
        <fieldset>
          <p className="my-4">
            Are you sure you want cancel the session between mentor &quot;
            {session.mentorSession.mentor.fullName}&quot; and student &quot;
            {session.studentSession.student.fullName}&quot;?
          </p>

          <Textarea
            placeholder="Cancel reason"
            name="cancelReason"
            readOnly={session.isCancelled}
            disabled={session.isCancelled}
            defaultValue={session.cancelledReason ?? ""}
            required
          />

          {!session.isCancelled && (
            <div className="mt-6 flex items-center justify-end">
              <button className="btn btn-error w-44 gap-4" type="submit">
                <BinFull className="h-6 w-6" />
                Cancel
              </button>
            </div>
          )}
        </fieldset>
      </Form>
    </>
  );
}
