import { useFetcher } from "@remix-run/react";
import { Send, Xmark } from "iconoir-react";

import { Title } from "../title/Title";
import { Textarea } from "../textarea/Textarea";
import { FileInput } from "../file-input/FileInput";
import { Message } from "../message/Message";

export function ReportErrorModal() {
  const { Form, data, submit, state } = useFetcher<{
    successMessage: string | null;
    errorMessage: string | null;
  }>();

  const isLoading = state !== "idle";

  return (
    <dialog id="report-error-modal" className="modal">
      <div className="modal-box w-11/12 max-w-5xl">
        <Title>Report error</Title>

        <Form
          method="POST"
          action="/report-error"
          encType="multipart/form-data"
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit(e.currentTarget);
            e.currentTarget.reset();
          }}
        >
          <fieldset disabled={isLoading}>
            <Textarea label="Description" name="description" required />
            <FileInput
              label="You can attach a screenshot of the error"
              name="file"
              accept="image/png, image/gif, image/jpeg"
            />

            <div className="modal-action flex-wrap gap-4">
              <Message
                key={Date.now()}
                successMessage={data?.successMessage}
                errorMessage={data?.errorMessage}
              />

              <button
                className="btn btn-block sm:w-48"
                type="button"
                onClick={() => {
                  (
                    document.getElementById(
                      "report-error-modal",
                    ) as HTMLDialogElement
                  ).close();
                }}
              >
                <Xmark />
                Close
              </button>

              <button
                className="btn btn-primary btn-block gap-2 sm:w-48"
                type="submit"
              >
                <Send />
                Send
              </button>
            </div>
          </fieldset>
        </Form>
      </div>
    </dialog>
  );
}
