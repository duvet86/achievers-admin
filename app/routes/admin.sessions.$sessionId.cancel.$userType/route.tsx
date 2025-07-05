import type { Route } from "./+types/route";

import { Form, redirect } from "react-router";
import { UserXmark } from "iconoir-react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";

import { Message, Select, Textarea, Title } from "~/components";

import { cancelSession, getSession, getCancelReasons } from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.sessionId, "sessionId not found");
  invariant(params.userType, "userType not found");

  const [cancelReasons, session] = await Promise.all([
    getCancelReasons(),
    getSession(Number(params.sessionId)),
  ]);

  if (session.completedOn !== null) {
    return redirect(`/admin/sessions/${params.sessionId}`);
  }

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
  invariant(params.userType, "userType not found");

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
    params.userType === "student" ? "STUDENT" : "MENTOR",
    Number(cancelledReasonId),
    cancelledExtendedReason,
  );

  return {
    successMessage: "Session cancelled successfully",
  };
}

export default function Index({
  params,
  loaderData: { cancelReasonsOptions, session },
  actionData,
}: Route.ComponentProps) {
  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Title>
          Mark absent {params.userType === "student" ? "student" : "mentor"}{" "}
          &quot;
          {params.userType === "student"
            ? session.studentSession.student.fullName
            : session.mentorSession.mentor.fullName}
          &quot; for session of &quot;
          {dayjs(session.attendedOn).format("MMMM D, YYYY")}
          &quot;
        </Title>

        <Message key={Date.now()} successMessage={actionData?.successMessage} />
      </div>

      <Form method="post">
        <fieldset className="fieldset p-4">
          <p>
            Are you sure you want to mark ABSENT &quot;
            {params.userType === "student"
              ? session.studentSession.student.fullName
              : session.mentorSession.mentor.fullName}
            &quot; for the session of{" "}
            {dayjs(session.attendedOn).format("MMMM D, YYYY")} with &quot;
            {params.userType === "student"
              ? session.studentSession.student.fullName
              : session.studentSession.student.fullName}
            &quot;?
          </p>

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
