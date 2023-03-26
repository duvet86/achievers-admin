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
    uploadHandler
  );

  const file = formData.get("file") as File | null;
  const expiryDate = formData.get("expiryDate")?.toString();

  if (file === null || file.size === 0 || expiryDate === undefined) {
    return json<{
      message: string | null;
    }>({
      message: "Missing required fields",
    });
  }

  const data: PoliceCheckUpdateCommand = {
    expiryDate,
    filePath: await saveFileAsync(params.userId, file),
  };

  await updatePoliceCheckAsync(Number(params.userId), data);

  return json<{
    message: string | null;
  }>({
    message: null,
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

      <Form method="post" encType="multipart/form-data">
        <fieldset disabled={transition.state === "submitting"}>
          <FileInput label="Police check file" name="file" required />

          <DateInput
            defaultValue={user.policeCheck?.expiryDate ?? ""}
            label="Expiry date"
            name="expiryDate"
            required
          />

          <SubmitFormButton message={actionData?.message} />
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
