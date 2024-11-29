import { useFetcher } from "react-router";
import { Send, Xmark } from "iconoir-react";

import { Title } from "../title/Title";
import { Textarea } from "../textarea/Textarea";
import { FileInput } from "../file-input/FileInput";
import { Message } from "../message/Message";

export function FeedbackModal() {
  const { Form, data, submit, state } = useFetcher<{
    successMessage: string | null;
    errorMessage: string | null;
  }>();

  const isLoading = state !== "idle";

  return (
    <dialog id="report-error-modal" className="modal">
      <div className="modal-box w-11/12 max-w-5xl">
        <div className="mb-4 flex justify-between">
          <Title>Feedback</Title>
          <button
            className="btn btn-circle btn-ghost"
            onClick={() => {
              (
                document.getElementById(
                  "report-error-modal",
                ) as HTMLDialogElement
              ).close();
            }}
          >
            <Xmark />
          </button>
        </div>

        <Form
          method="POST"
          action="/report-error"
          encType="multipart/form-data"
          onSubmit={(e) => {
            e.preventDefault();
            void submit(e.currentTarget);
            e.currentTarget.reset();
          }}
        >
          <fieldset
            disabled={isLoading}
            className="relative flex flex-col gap-4"
          >
            {isLoading && (
              <div className="absolute z-10 flex h-full w-full justify-center bg-slate-300 bg-opacity-50">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            )}

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
