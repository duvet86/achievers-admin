import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { PoliceCheckUpdateCommand } from "./services.server";

import {
  json,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { DateInput, Title, FileInput, SubmitFormButton } from "~/components";

import {
  getFileUrlAsync,
  getUserByIdAsync,
  updatePoliceCheckAsync,
  saveFileAsync,
} from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  const filePath = user?.policeCheck?.filePath
    ? await getFileUrlAsync(user.policeCheck.filePath)
    : null;

  return json({
    user: {
      ...user,
      filePath,
    },
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.userId, "userId not found");

  try {
    const uploadHandler = unstable_createMemoryUploadHandler();

    const formData = await unstable_parseMultipartFormData(
      request,
      uploadHandler,
    );

    const file = formData.get("file") as File;
    const expiryDate = formData.get("expiryDate")?.toString();

    if (expiryDate === undefined) {
      return json({
        errorMessage: "Missing required fields",
      });
    }

    const data: PoliceCheckUpdateCommand = {
      expiryDate,
      filePath:
        file.size > 0 ? await saveFileAsync(params.userId, file) : undefined,
    };

    await updatePoliceCheckAsync(Number(params.userId), data);
  } catch (e: unknown) {
    return json({
      errorMessage: (e as Error).message,
    });
  }

  return json({
    errorMessage: null,
  });
}

export default function Index() {
  const transition = useNavigation();
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <>
      <Title>
        Police check for &quot;{user.firstName} {user.lastName}&quot;
      </Title>

      <a
        href="https://wfv.identityservice.auspost.com.au/wfvselfinvite/wapol/invite-candidate"
        className="link link-info mb-4"
        target="_blank"
        rel="noopener noreferrer"
      >
        VNPC Portal
      </a>

      <Form method="post" encType="multipart/form-data">
        <fieldset disabled={transition.state === "submitting"}>
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
            errorMessage={actionData?.errorMessage}
            className="mt-6 justify-between"
          />
        </fieldset>
      </Form>
    </>
  );
}
