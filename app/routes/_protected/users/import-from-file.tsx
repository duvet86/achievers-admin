import type { ActionArgs, TypedResponse } from "@remix-run/server-runtime";
import type { SpeadsheetUser } from "~/models/speadsheet";

import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  json,
} from "@remix-run/server-runtime";
import { Form, useActionData } from "@remix-run/react";

import ArrowUpTrayIcon from "@heroicons/react/24/solid/ArrowUpTrayIcon";
import { readExcelFileAsync } from "~/services/read-excel-file.server";

export const action = async ({
  request,
}: ActionArgs): Promise<
  TypedResponse<{
    users: SpeadsheetUser[];
    message: string | null;
  }>
> => {
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 500_000,
  });
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const file = formData.get("usersSheet");
  if (!file) {
    return json({
      users: [],
      message: "Choose a file",
    });
  }

  return json({
    users: await readExcelFileAsync(file as File),
    message: null,
  });
};

export default function ImportFromFile() {
  const data = useActionData<typeof action>();

  return (
    <Form
      method="post"
      encType="multipart/form-data"
      className="flex flex-col gap-8"
    >
      <div className="form-control w-full max-w-xs">
        <label htmlFor="usersSheet" className="label">
          <span className="label-text">
            Upload a spreadsheet with new users
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
      <div className="ml-4">
        {data?.users.map((u, index) => (
          <ul key={index} className="list-disc">
            <li>{u["First Name"]}</li>
            <li>{u["Last Name"]}</li>
          </ul>
        ))}
      </div>
    </Form>
  );
}
