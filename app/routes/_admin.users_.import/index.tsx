import type { ActionArgs } from "@remix-run/node";

import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  json,
} from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";

import { isEmail, isStringNullOrEmpty, getAzureUsersAsync } from "~/services";

import { Import } from "iconoir-react";

import { LoadingSpinner, Title, BackHeader } from "~/components";

import { readExcelFileAsync, getChaptersAsync } from "./services.server";
import { prisma } from "~/db.server";

export const action = async ({ request }: ActionArgs) => {
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 500_000,
  });

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const file = formData.get("usersSheet");
  if (file === null || !(file instanceof File)) {
    return json({
      newUsers: [],
      message: "Choose a file",
    });
  }

  const fileUsers = await readExcelFileAsync(file);

  if (fileUsers.length === 0) {
    return json({
      newUsers: [],
      message: "Nothing to import",
    });
  }

  const chapters = await getChaptersAsync();

  const incorrectEmails = fileUsers.reduce<string[]>((res, fileUser, index) => {
    if (
      isStringNullOrEmpty(fileUser["Email address"]) ||
      !isEmail(fileUser["Email address"])
    ) {
      res.push(`row number: ${index + 1}, email: ${fileUser["Email address"]}`);
    }
    return res;
  }, []);

  if (incorrectEmails.length > 0) {
    return json({
      newUsers: [],
      message: `Incorrect emails: \n- ${incorrectEmails.join("\n- ")}`,
    });
  }

  const azureUsers = await getAzureUsersAsync(request);

  const azureUsersLookup = azureUsers.reduce<Record<string, string>>(
    (res, { email }) => {
      res[email.toLowerCase()] = email.toLowerCase();

      return res;
    },
    {}
  );

  const newUsers = fileUsers.filter(
    (fileUser) =>
      azureUsersLookup[fileUser["Email address"].toLowerCase()] === undefined
  );

  try {
    // await prisma.$transaction(async (tx) => {
    //   for (let i = 0; i < newUsers.length; i++) {
    //     const chapter = chapters.find((c) => c.name === newUsers[i]["Chapter"]);
    //     await tx.user.create({
    //       addressPostcode: "",
    //       addressState: "",
    //       addressSuburb: "",
    //       email: newUsers[i]["Email address"],
    //       addressStreet: newUsers[i]["Residential Address"],
    //       additionalEmail: newUsers[i][
    //         "Additional email addresses (for intranet access)"
    //       ]
    //         ? newUsers[i]["Additional email addresses (for intranet access)"]
    //         : null,
    //       dateOfBirth: new Date(newUsers[i]["Date of Birth"]),
    //       emergencyContactAddress: newUsers[i]["Emergency Contact Address"],
    //       emergencyContactName: newUsers[i]["Emergency Contact Name"],
    //       emergencyContactNumber: newUsers[i]["Emergency Contact Name"],
    //       emergencyContactRelationship:
    //         newUsers[i]["Emergency Contact Relationship"],
    //       endDate: newUsers[i]["End Date"]
    //         ? new Date(newUsers[i]["End Date"])
    //         : null,
    //       firstName: newUsers[i]["First Name"],
    //       azureADId: null,
    //       lastName: newUsers[i]["Last Name"],
    //       mobile: newUsers[i]["Mobile"].toString(),
    //       userAtChapter: {
    //         create: {
    //           assignedBy: "import",
    //           chapterId: chapter?.id ?? chapters[0].id,
    //         },
    //       },
    //     });
    //   }
    // });
  } catch (e: any) {
    console.error(e);

    return json({
      newUsers: [],
      message: e.message,
    });
  }

  return json({
    newUsers,
    message: null,
  });
};

export default function Index() {
  const actionData = useActionData<typeof action>();
  const transition = useNavigation();

  const isLoading = transition.state === "loading";
  const isSubmitting = transition.state === "submitting";

  const isDisabled = isLoading || isSubmitting;

  return (
    <>
      <BackHeader />

      <Title>Import from file</Title>

      <Form
        method="post"
        encType="multipart/form-data"
        className="relative flex h-full flex-col gap-8"
      >
        <div className="form-control w-full max-w-xs">
          <label htmlFor="usersSheet" className="label">
            <span className="label-text">
              Upload a spreadsheet with new users
            </span>
          </label>
          <input
            type="file"
            id="usersSheet"
            name="usersSheet"
            className="file-input-bordered file-input w-full"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            disabled={isDisabled}
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="btn-primary btn gap-2"
            disabled={isDisabled}
          >
            <Import className="h-6 w-6" />
            Import
          </button>
          {isDisabled && <LoadingSpinner dark />}
        </div>

        {actionData?.message && (
          <div className="card bg-error">
            <div className="card-body">
              <h2 className="card-title">Error!</h2>
              <pre className="whitespace-pre-wrap">{actionData.message}</pre>
            </div>
          </div>
        )}

        <div className="text-info">
          {!actionData?.message && actionData?.newUsers.length === 0 && (
            <p>No new users to import.</p>
          )}
        </div>
        <div className="ml-4">
          {actionData?.newUsers.map((u, index) => (
            <ul key={index} className="list-disc">
              <li>{u["First Name"]}</li>
              <li>{u["Last Name"]}</li>
              <li>{u["Email address"]}</li>
            </ul>
          ))}
        </div>
      </Form>
    </>
  );
}
