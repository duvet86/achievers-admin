import type { Route } from "./+types/route";
import type { UpdateWWCCheckCommand } from "./services.server";

import { parseFormData } from "@mjackson/form-data-parser";
import { Form } from "react-router";
import invariant from "tiny-invariant";

import {
  DateInput,
  Title,
  FileInput,
  Input,
  SubmitFormButton,
} from "~/components";

import {
  getFileUrl,
  getUserByIdAsync,
  saveFileAsync,
  updateWWCCheckAsync,
  uploadHandler,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  const filePath = user?.wwcCheck?.filePath
    ? getFileUrl(user.wwcCheck.filePath)
    : null;

  return {
    user: {
      ...user,
      filePath,
    },
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.userId, "userId not found");

  try {
    const formData = await parseFormData(request, uploadHandler);

    const file = formData.get("file") as File;
    const expiryDate = formData.get("expiryDate")?.toString();
    const wwcNumber = formData.get("wwcNumber")?.toString();

    if (expiryDate === undefined || wwcNumber === undefined) {
      return {
        successMessage: null,
        errorMessage: "Missing required fields",
      };
    }

    const data: UpdateWWCCheckCommand = {
      expiryDate,
      wwcNumber,
      filePath:
        file.size > 0 ? await saveFileAsync(params.userId, file) : undefined,
    };

    await updateWWCCheckAsync(Number(params.userId), data);
  } catch (e: unknown) {
    return {
      successMessage: null,
      errorMessage: (e as Error).message,
    };
  }

  return {
    successMessage: "Success",
    errorMessage: null,
  };
}

export default function Index({
  loaderData: { user },
  actionData,
}: Route.ComponentProps) {
  return (
    <>
      <Title>WWC check for &quot;{user.fullName}&quot;</Title>

      <hr className="my-4" />

      <Form method="post" encType="multipart/form-data">
        <fieldset className="fieldset">
          <Input
            defaultValue={user?.wwcCheck?.wwcNumber ?? ""}
            label="WWC number"
            name="wwcNumber"
            required
          />

          <DateInput
            defaultValue={user.wwcCheck?.expiryDate ?? ""}
            label="Expiry date"
            name="expiryDate"
            required
          />

          <FileInput
            label="WWC check file"
            name="file"
            accept="application/pdf, image/png, image/jpeg"
          />

          {user.filePath && (
            <article className="prose mt-6">
              <h3>
                A WWC check has been uploaded. Click on the link below to
                download.
              </h3>

              <a href={user.filePath} target="_blank" rel="noreferrer" download>
                Downlod WWC check
              </a>
            </article>
          )}

          <SubmitFormButton
            successMessage={actionData?.successMessage}
            errorMessage={actionData?.errorMessage}
            className="mt-6 justify-between"
          />
        </fieldset>
      </Form>
    </>
  );
}
