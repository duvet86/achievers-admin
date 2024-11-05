import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  type ActionFunctionArgs,
} from "@remix-run/node";

import { getLoggedUserInfoAsync, trackException } from "~/services/.server";

import {
  getUserByAzureADIdAsync,
  submitSupportRequestAsync,
} from "./services.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const loggedUser = await getLoggedUserInfoAsync(request);
    const user = await getUserByAzureADIdAsync(loggedUser.oid);

    const uploadHandler = unstable_createMemoryUploadHandler();

    const formData = await unstable_parseMultipartFormData(
      request,
      uploadHandler,
    );

    const file = formData.get("file") as File | null;

    const attachments = [];
    if (file) {
      const filesize = Number((file.size / 1024 / 1024).toFixed(4)); // MB
      if (filesize > 1.5) {
        return {
          errorMessage: "File too large. Max size is 1 MB.",
          successMessage: null,
        };
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const base64String = buffer.toString("base64");
      attachments.push({
        name: file.name,
        content: base64String,
      });
    }

    await submitSupportRequestAsync({
      azureId: loggedUser.oid,
      userId: user?.id,
      email: user?.email,
      description: formData.get("description")!.toString(),
      attachments,
    });

    return {
      errorMessage: null,
      successMessage: "Successfully submitted. You can close the window now.",
    };
  } catch (e) {
    trackException(e as Error);

    return {
      errorMessage: "File too large. Max size is 1 MB.",
      successMessage: null,
    };
  }
}
