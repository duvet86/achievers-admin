import type { Route } from "./+types/route";
import type { UpdateWWCCheckCommand } from "./services.server";

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
  getFileUrl,
  getWWCCheckByIdAsync,
  saveFileAsync,
  updateWWCCheckAsync,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.mentorId, "mentorId not found");
  invariant(params.checkId, "checkId not found");

  const check = await getWWCCheckByIdAsync(
    Number(params.mentorId),
    Number(params.checkId),
  );

  return {
    user: check.volunteer,
    check: {
      wwcNumber: check.wwcNumber,
      expiryDate: check.expiryDate,
      fileUrl: check.filePath ? getFileUrl(check.filePath) : null,
    },
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.mentorId, "mentorId not found");
  invariant(params.checkId, "checkId not found");

  try {
    const formData = await parseFormData(request, uploadHandler);

    const file = formData.get("file");
    const expiryDate = formData.get("expiryDate")?.toString();
    const wwcNumber = formData.get("wwcNumber")?.toString();

    if (expiryDate === undefined || wwcNumber === undefined) {
      return {
        successMessage: null,
        errorMessage: "Missing required fields",
      };
    }

    const check = await getWWCCheckByIdAsync(
      Number(params.mentorId),
      Number(params.checkId),
    );

    const data: UpdateWWCCheckCommand = {
      expiryDate,
      wwcNumber,
      // A file can only be uploaded if the check doesn't have one yet.
      filePath:
        !check.filePath && file instanceof File && file.size > 0
          ? await saveFileAsync(params.mentorId, file)
          : undefined,
    };

    memoryHandlerDispose("file");

    await updateWWCCheckAsync(
      Number(params.mentorId),
      Number(params.checkId),
      data,
    );
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
  loaderData: { user, check },
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
      <Title>Edit WWC check for &quot;{user.fullName}&quot;</Title>

      <hr className="my-4" />

      <Form method="post" encType="multipart/form-data">
        <fieldset className="fieldset">
          <Input
            defaultValue={check.wwcNumber}
            label="WWC number"
            name="wwcNumber"
            required
          />

          <DateInput
            defaultValue={check.expiryDate}
            label="Expiry date"
            name="expiryDate"
            required
          />

          {check.fileUrl ? (
            <article className="prose mt-6">
              <h3>
                A WWC check file has been uploaded. Click on the link below to
                download.
              </h3>

              <a href={check.fileUrl} target="_blank" rel="noreferrer" download>
                Download WWC check
              </a>
            </article>
          ) : (
            <FileInput
              label="WWC check file"
              name="file"
              accept="application/pdf, image/png, image/jpeg"
            />
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
