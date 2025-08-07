import type { EditorState } from "lexical";
import type { Route } from "./+types/route";

import { useRef } from "react";
import { Form, redirect, useFetcher } from "react-router";
import { UserXmark, WarningTriangle } from "iconoir-react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";

import { isEditorEmpty } from "~/services";
import { Editor, Message, Select, Title } from "~/components";

import editorStylesheetUrl from "~/styles/editor.css?url";

import { cancelSession, getSession, getCancelReasons } from "./services.server";

export const links: Route.LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStylesheetUrl }];
};

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

  const bodyData = (await request.json()) as {
    cancelledReasonId: string;
    report: string;
  };

  console.log("bodyData", bodyData);

  if (!bodyData.cancelledReasonId || !bodyData.report) {
    throw new Error();
  }

  await cancelSession(
    Number(params.sessionId),
    params.userType === "student" ? "STUDENT" : "MENTOR",
    Number(bodyData.cancelledReasonId),
    bodyData.report,
  );

  return {
    successMessage: "Session cancelled successfully",
  };
}

export default function Index({
  params,
  loaderData: { cancelReasonsOptions, session },
}: Route.ComponentProps) {
  const editorStateRef = useRef<EditorState>(null);
  const { submit, data } = useFetcher<typeof action>();

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const resportState = editorStateRef.current!;

    if (isEditorEmpty(resportState)) {
      (document.getElementById("errorModal") as HTMLDialogElement).showModal();
      return;
    }

    void submit(
      {
        cancelledReasonId: formData.get("cancelledReasonId")!.toString(),
        report: JSON.stringify(resportState.toJSON()),
      },
      {
        method: "POST",
        encType: "application/json",
      },
    );
  };

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

        <Message key={Date.now()} successMessage={data?.successMessage} />
      </div>

      <Form onSubmit={onFormSubmit}>
        <fieldset className="fieldset p-4">
          <p>
            Yuo are about to mark ABSENT &quot;
            {params.userType === "student"
              ? session.studentSession.student.fullName
              : session.mentorSession.mentor.fullName}
            &quot; for the session of{" "}
            {dayjs(session.attendedOn).format("MMMM D, YYYY")} with &quot;
            {params.userType === "student"
              ? session.studentSession.student.fullName
              : session.studentSession.student.fullName}
            &quot;
          </p>

          <Select
            name="cancelledReasonId"
            disabled={session.isCancelled}
            options={cancelReasonsOptions}
            defaultValue={session.cancelledReasonId?.toString() ?? ""}
            required
          />

          <div className="min-h-56">
            <Editor
              isReadonly={session.isCancelled}
              initialEditorStateType={session.report}
              onChange={(editorState) => (editorStateRef.current = editorState)}
            />
          </div>

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
      <dialog id="errorModal" className="modal">
        <div className="modal-box">
          <h3 className="flex gap-2 text-lg font-bold">
            <WarningTriangle className="text-error" />
            Please write a report
          </h3>
          <p className="py-4">Report cannot be blank.</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
