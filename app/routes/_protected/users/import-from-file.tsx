import type { ActionArgs } from "@remix-run/server-runtime";

import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/server-runtime";
import { Form } from "@remix-run/react";

import ArrowUpTrayIcon from "@heroicons/react/24/solid/ArrowUpTrayIcon";

export const action = async ({ request }: ActionArgs) => {
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 500_000,
  });
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const file = formData.get("usersSheet");

  console.log("file", file);

  return null;
};

export default function ImportFromFile() {
  return (
    <Form
      method="post"
      encType="multipart/form-data"
      className="flex flex-col gap-8"
    >
      <div className="form-control w-full max-w-xs">
        <label htmlFor="usersSheet" className="label">
          <span className="label-text">
            Upload a spreadsheet with new users.
          </span>
        </label>
        <input
          type="file"
          id="usersSheet"
          name="usersSheet"
          className="file-input-bordered file-input-primary file-input w-full"
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        />
      </div>

      <div>
        <button type="submit" className="btn-primary btn gap-2">
          <ArrowUpTrayIcon className="h-6 w-6" />
          Import users from file
        </button>
      </div>
    </Form>
  );
}
