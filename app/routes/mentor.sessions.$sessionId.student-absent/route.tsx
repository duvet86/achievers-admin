import type { EditorState } from "lexical";
import type { Route } from "./+types/route";

import { useRef } from "react";
import { Form, redirect, useFetcher } from "react-router";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import { UserXmark, WarningTriangle } from "iconoir-react";

import { isEditorEmpty } from "~/services";
import { Editor, Message, Select, Title } from "~/components";

import editorStylesheetUrl from "~/styles/editor.css?url";

import {
  cancelSession,
  getCancelReasons,
  getSessionAsync,
} from "./services.server";

export const links: Route.LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStylesheetUrl }];
};

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.sessionId, "sessionId not found");

  const session = await getSessionAsync(Number(params.sessionId));

  if (session.isCancelled) {
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

  const bodyData = (await request.json()) as {
    cancelledReasonId: string;
    report: string;
  };

  if (!bodyData.cancelledReasonId || !bodyData.report) {
    throw new Error();
  }

  await cancelSession(
    Number(params.sessionId),
    "STUDENT",
    Number(bodyData.cancelledReasonId),
    bodyData.report,
  );

  return {
    successMessage: "Student mark as absent successfully",
  };
}

export default function Index({
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
        <Title className="text-error">
          {`Mark "${session.studentSession.student.fullName}" as absent for the "${dayjs(session.attendedOn).format("MMMM D, YYYY")}"`}
        </Title>

        <Message key={Date.now()} successMessage={data?.successMessage} />
      </div>

      <Form onSubmit={onFormSubmit}>
        <fieldset className="fieldset p-4">
          <p>
            You are about to mark ABSENT &quot;
            {session.studentSession.student.fullName}
            &quot; for the session of{" "}
            {dayjs(session.attendedOn).format("MMMM D, YYYY")}
          </p>

          <Select
            name="cancelledReasonId"
            options={cancelReasonsOptions}
            defaultValue={session.cancelledReasonId?.toString() ?? ""}
            required
          />

          <div className="min-h-56">
            <Editor
              initialEditorStateType={session.report}
              onChange={(editorState) => (editorStateRef.current = editorState)}
            />
          </div>

          <div className="mt-6 flex items-center justify-end">
            <button className="btn btn-error w-44" type="submit">
              <UserXmark />
              Save
            </button>
          </div>
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
