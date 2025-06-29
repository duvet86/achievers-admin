import type { Route } from "./+types/route";

import { parseFormData } from "@mjackson/form-data-parser";

import {
  getLoggedUserInfoAsync,
  memoryHandlerDispose,
  trackException,
  uploadHandler,
} from "~/services/.server";

import {
  getUserByAzureADIdAsync,
  submitSupportRequestAsync,
} from "./services.server";

export async function action({ request }: Route.ActionArgs) {
  try {
    const loggedUser = await getLoggedUserInfoAsync(request);
    const user = await getUserByAzureADIdAsync(loggedUser.oid);

    const formData = await parseFormData(request, uploadHandler);

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
      email: user?.email ?? loggedUser?.email ?? loggedUser.preferred_username,
      description: formData.get("description")!.toString(),
      attachments,
    });

    memoryHandlerDispose("file");

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
