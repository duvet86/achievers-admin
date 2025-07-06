import type { Route } from "./+types/route";

import { Form, redirect } from "react-router";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import { UserXmark } from "iconoir-react";

import { Message, Select, Textarea, Title } from "~/components";

import {
  cancelSession,
  getCancelReasons,
  getSessionAsync,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.sessionId, "sessionId not found");

  const session = await getSessionAsync(Number(params.sessionId));

  if (session.completedOn !== null) {
    return redirect(`/mentor/view-reports/${params.sessionId}`);
  }

  const cancelReasons = await getCancelReasons();

  return {
    cancelReasonsOptions: [
      {
        label: "Select a reason",
        value: "",
      },
    ].concat(
      cancelReasons.map(({ id, reason }) => ({
        label: reason,
        value: id.toString(),
      })),
    ),
    session,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.sessionId, "sessionId not found");

  const formData = await request.formData();

  const cancelledReasonId = formData.get("cancelledReasonId")?.toString();
  const cancelledExtendedReason = formData
    .get("cancelledExtendedReason")
    ?.toString();

  if (
    cancelledReasonId === undefined ||
    cancelledExtendedReason === undefined
  ) {
    throw new Error();
  }

  await cancelSession(
    Number(params.sessionId),
    "STUDENT",
    Number(cancelledReasonId),
    cancelledExtendedReason,
  );

  return {
    successMessage: "Student mark as absent successfully",
  };
}

export default function Index({
  loaderData: { cancelReasonsOptions, session },
  actionData,
}: Route.ComponentProps) {
  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Title>
          {session.isCancelled
            ? `Student "${session.studentSession.student.fullName}" was absent for the "${dayjs(session.attendedOn).format("MMMM D, YYYY")}"`
            : `Mark "${session.studentSession.student.fullName}" as absent for the "${dayjs(session.attendedOn).format("MMMM D, YYYY")}"`}
        </Title>

        <Message key={Date.now()} successMessage={actionData?.successMessage} />
      </div>

      <Form method="post">
        <fieldset className="fieldset p-4">
          {!session.isCancelled && (
            <p>
              You are about to mark ABSENT &quot;
              {session.studentSession.student.fullName}
              &quot; for the session of{" "}
              {dayjs(session.attendedOn).format("MMMM D, YYYY")}
            </p>
          )}

          <Select
            name="cancelledReasonId"
            disabled={session.isCancelled}
            options={cancelReasonsOptions}
            defaultValue={session.cancelledReasonId?.toString() ?? ""}
            required
          />

          <Textarea
            placeholder="Note"
            name="cancelledExtendedReason"
            readOnly={session.isCancelled}
            disabled={session.isCancelled}
            defaultValue={session.cancelledExtendedReason ?? ""}
            required
          />

          {!session.isCancelled && (
            <div className="mt-6 flex items-center justify-end">
              <button className="btn btn-error w-44" type="submit">
                <UserXmark />
                Save
              </button>
            </div>
          )}
        </fieldset>
      </Form>
    </>
  );
}
