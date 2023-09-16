import type { ActionArgs, LoaderArgs } from "@remix-run/node";
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

import {
  BackHeader,
  DateInput,
  Title,
  FileInput,
  SubmitFormButton,
} from "~/components";

import {
  getFileUrlAsync,
  getUserByIdAsync,
  updatePoliceCheckAsync,
  saveFileAsync,
} from "./services.server";

export async function loader({ params }: LoaderArgs) {
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

export async function action({ request, params }: ActionArgs) {
  invariant(params.userId, "userId not found");

  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 500_000,
  });

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
      <BackHeader />

      <Title>
        Police check for "{user.firstName} {user.lastName}"
      </Title>

      <a
        href="https://wfv.identityservice.auspost.com.au/wfvselfinvite/wapol/invite-candidate"
        className="link-info link mb-4"
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

          <FileInput label="Police check file" name="file" />

          <SubmitFormButton errorMessage={actionData?.errorMessage} />
        </fieldset>
      </Form>

      {user.filePath && (
        <a href={user.filePath} className="link-primary link p-2" download>
          Downlod file
        </a>
      )}
    </>
  );
}
