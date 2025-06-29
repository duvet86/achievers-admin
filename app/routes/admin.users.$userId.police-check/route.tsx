import type { Route } from "./+types/route";
import type { PoliceCheckUpdateCommand } from "./services.server";

import { parseFormData } from "@mjackson/form-data-parser";
import { Form } from "react-router";
import invariant from "tiny-invariant";

import { memoryHandlerDispose, uploadHandler } from "~/services/.server";
import { DateInput, Title, FileInput, SubmitFormButton } from "~/components";

import {
  getFileUrl,
  getUserByIdAsync,
  updatePoliceCheckAsync,
  saveFileAsync,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  const filePath = user?.policeCheck?.filePath
    ? getFileUrl(user.policeCheck.filePath)
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

    if (expiryDate === undefined) {
      return {
        successMessage: null,
        errorMessage: "Missing required fields",
      };
    }

    const data: PoliceCheckUpdateCommand = {
      expiryDate,
      filePath:
        file.size > 0 ? await saveFileAsync(params.userId, file) : undefined,
    };

    memoryHandlerDispose("file");

    await updatePoliceCheckAsync(Number(params.userId), data);
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
      <Title>Police check for &quot;{user.fullName}&quot;</Title>

      <a
        href="https://wfv.identityservice.auspost.com.au/wfvselfinvite/wapol/invite-candidate"
        className="link link-info my-4"
        target="_blank"
        rel="noopener noreferrer"
      >
        VNPC Portal
      </a>

      <Form method="post" encType="multipart/form-data">
        <fieldset className="fieldset">
          <DateInput
            defaultValue={user.policeCheck?.expiryDate ?? ""}
            label="Expiry Date (3 years from issue)"
            name="expiryDate"
            required
          />

          <FileInput
            label="Police check file"
            name="file"
            accept="application/pdf, image/png, image/jpeg"
          />

          {user.filePath && (
            <article className="prose mt-6">
              <h3>
                A police check has been uploaded. Click on the link below to
                download.
              </h3>

              <a href={user.filePath} target="_blank" rel="noreferrer" download>
                Downlod police check
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
