import type { Route } from "./+types/route";
import type { CreatePoliceCheckCommand } from "./services.server";

import { parseFormData } from "@mjackson/form-data-parser";
import { Form, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import invariant from "tiny-invariant";

import { memoryHandlerDispose, uploadHandler } from "~/services/.server";
import { isStringNullOrEmpty } from "~/services";
import {
  DateInput,
  Title,
  FileInput,
  Input,
  SubmitFormButton,
} from "~/components";

import {
  createPoliceCheckAsync,
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
    const applicationNumber = formData.get("applicationNumber")?.toString();

    if (expiryDate === undefined) {
      return {
        successMessage: null,
        errorMessage: "Missing required fields",
      };
    }

    const data: CreatePoliceCheckCommand = {
      expiryDate,
      applicationNumber: isStringNullOrEmpty(applicationNumber)
        ? null
        : applicationNumber,
      filePath:
        file.size > 0 ? await saveFileAsync(params.mentorId, file) : null,
    };

    memoryHandlerDispose("file");

    await createPoliceCheckAsync(Number(params.mentorId), data);
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
      history[history.length - 1] ?? `/admin/mentors/${user.id}/police-check`,
      {
        replace: true,
        state: { history: history.slice(0, -1) },
      },
    );
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [isSuccess]);

  return (
    <>
      <Title>Add police check for &quot;{user.fullName}&quot;</Title>

      <hr className="my-4" />

      <Form method="post" encType="multipart/form-data">
        <fieldset className="fieldset">
          <DateInput
            label="Expiry Date (3 years from issue)"
            name="expiryDate"
            required
          />

          <Input label="Application Number" name="applicationNumber" />

          <FileInput
            label="Police check file"
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
