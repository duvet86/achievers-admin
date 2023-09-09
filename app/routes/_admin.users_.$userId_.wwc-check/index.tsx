import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import type { UpdateWWCCheckCommand } from "./services.server";

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
  Input,
  SubmitFormButton,
} from "~/components";

import {
  getFileUrl,
  getUserByIdAsync,
  saveFileAsync,
  updateWWCCheckAsync,
} from "./services.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  const filePath = user?.wwcCheck?.filePath
    ? await getFileUrl(user.wwcCheck.filePath)
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

  const file = formData.get("file") as File | null;
  const expiryDate = formData.get("expiryDate")?.toString();
  const wwcNumber = formData.get("wwcNumber")?.toString();

  if (
    file === null ||
    file.size === 0 ||
    expiryDate === undefined ||
    wwcNumber === undefined
  ) {
    return json({
      errorMessage: "Missing required fields",
    });
  }

  const data: UpdateWWCCheckCommand = {
    expiryDate,
    wwcNumber,
    filePath: await saveFileAsync(params.userId, file),
  };

  await updateWWCCheckAsync(Number(params.userId), data);

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
        WWC check for "{user.firstName} {user.lastName}"
      </Title>

      <Form method="post" encType="multipart/form-data">
        <fieldset disabled={transition.state === "submitting"}>
          <FileInput label="Police check file" name="filePath" required />

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
