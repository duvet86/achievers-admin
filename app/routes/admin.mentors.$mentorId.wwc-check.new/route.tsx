import type { Route } from "./+types/route";
import type { CreateWWCCheckCommand } from "./services.server";

import { parseFormData } from "@mjackson/form-data-parser";
import { Form, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import invariant from "tiny-invariant";

import { memoryHandlerDispose, uploadHandler } from "~/services/.server";
import {
  DateInput,
  Title,
  FileInput,
  Input,
  SubmitFormButton,
} from "~/components";

import {
  createWWCCheckAsync,
  getUserByIdAsync,
  saveFileAsync,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.mentorId, "mentorId not found");

  const user = await getUserByIdAsync(Number(params.mentorId));

  return {
    user,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.mentorId, "mentorId not found");

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

    const data: CreateWWCCheckCommand = {
      expiryDate,
      wwcNumber,
      filePath:
        file.size > 0 ? await saveFileAsync(params.mentorId, file) : undefined,
    };

    memoryHandlerDispose("file");

    await createWWCCheckAsync(Number(params.mentorId), data);
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
  const location = useLocation();
  const navigate = useNavigate();

  const isSuccess = actionData?.successMessage != null;

  // Once the check is saved, go back to the list (same as the title's back button).
  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const history: string[] = location.state?.history ?? [];

    void navigate(
      history[history.length - 1] ?? `/admin/mentors/${user.id}/wwc-check`,
      {
        replace: true,
        state: { history: history.slice(0, -1) },
      },
    );
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [isSuccess]);

  return (
    <>
      <Title>Add WWC check for &quot;{user.fullName}&quot;</Title>

      <hr className="my-4" />

      <Form method="post" encType="multipart/form-data">
        <fieldset className="fieldset">
          <Input label="WWC number" name="wwcNumber" required />

          <DateInput label="Expiry date" name="expiryDate" required />

          <FileInput
            label="WWC check file"
            name="file"
            accept="application/pdf, image/png, image/jpeg"
          />

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
