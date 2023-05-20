import type { ActionArgs, TypedResponse } from "@remix-run/node";
import type { Prisma } from "@prisma/client";
import type { SpeadsheetUser } from "~/models/speadsheet";
import type { AzureInviteResponse } from "~/services";

// import { getChaptersAsync } from "./services.server";

import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  json,
} from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";

import {
  isEmail,
  isStringNullOrEmpty,
  getAzureUsersAsync,
  inviteUserToAzureAsync,
  getCurrentHost,
} from "~/services";

import { Import } from "iconoir-react";

import { LoadingSpinner, Title, BackHeader } from "~/components";

import { readExcelFileAsync, createManyUsersAsync } from "./services.server";

export const action = async ({
  request,
}: ActionArgs): Promise<
  TypedResponse<{
    newUsers: SpeadsheetUser[];
    responses: AzureInviteResponse[];
    message: string | null;
  }>
> => {
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
      responses: [],
      message: "Choose a file",
    });
  }

  const fileUsers = await readExcelFileAsync(file);

  if (fileUsers.length === 0) {
    return json({
      newUsers: [],
      responses: [],
      message: "Nothing to import",
    });
  }

  // const chapters = await getChaptersAsync();

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
      responses: [],
      message: `Incorrect emails: \n- ${incorrectEmails.join("\n- ")}`,
    });
  }

  const dbUsers: Prisma.UserCreateManyInput[] = [];
  // const dbUsersAtChapters: Prisma.UserAtChapterCreateManyInput[] = [];
  const responses: AzureInviteResponse[] = [];

  const azureUsers = await getAzureUsersAsync(request);

  const azureUsersLookup = azureUsers.reduce<Record<string, string>>(
    (res, { email }) => {
      res[email.toLowerCase()] = email;

      return res;
    },
    {}
  );

  const newUsers = fileUsers.filter(
    (fileUser) =>
      azureUsersLookup[fileUser["Email address"].toLowerCase()] === undefined
  );

  const webUrl = getCurrentHost(request);

  for (let i = 0; i < newUsers.length; i++) {
    const response = await inviteUserToAzureAsync(request, {
      invitedUserEmailAddress: newUsers[i]["Email address"],
      inviteRedirectUrl: webUrl,
      sendInvitationMessage: true,
    });

    responses.push(response);

    // const chapter = chapters.find((c) => c.name === newUsers[i]["Chapter"]);

    dbUsers.push({
      addressPostcode: "",
      addressState: "",
      addressSuburb: "",
      email: newUsers[i]["Email address"],
      // chapterId: chapter?.id ?? chapters[0].id,
      addressStreet: newUsers[i]["Residential Address"],
      additionalEmail: newUsers[i][
        "Additional email addresses (for intranet access)"
      ]
        ? newUsers[i]["Additional email addresses (for intranet access)"]
        : null,
      // defaultAttendance: newUsers[i]["Attendance"]
      //   ? newUsers[i]["Attendance"]
      //   : null,
      // boardTermExpiryDate: newUsers[i]["Board Term Expiry"]
      //   ? new Date(newUsers[i]["Board Term Expiry"])
      //   : null,
      dateOfBirth: new Date(newUsers[i]["Date of Birth"]),
      // directorIdentificationNumber: newUsers[i][
      //   "Director Identification Number"
      // ]
      //   ? newUsers[i]["Director Identification Number"]
      //   : null,
      emergencyContactAddress: newUsers[i]["Emergency Contact Address"],
      emergencyContactName: newUsers[i]["Emergency Contact Name"],
      emergencyContactNumber: newUsers[i]["Emergency Contact Name"],
      emergencyContactRelationship:
        newUsers[i]["Emergency Contact Relationship"],
      endDate: newUsers[i]["End Date"]
        ? new Date(newUsers[i]["End Date"])
        : null,
      firstName: newUsers[i]["First Name"],
      azureADId: response.invitedUser.id,
      // inductionDate: newUsers[i]["Induction Date"]
      //   ? new Date(newUsers[i]["Induction Date"])
      //   : newUsers[i]["Induction Date"],
      // isActive: newUsers[i]["Active Mentor"] === "Yes",
      // isApprovedByMRC: newUsers[i]["Approved by MRC?"] === "Yes",
      // isBoardMemeber: newUsers[i]["Board Member"] === "Yes",
      // isCommiteeMemeber: newUsers[i]["Committee Member"] === "Yes",
      // isCurrentMemeber: newUsers[i]["Current Member"] === "Yes",
      // isPublishPhotoApproved:
      //   newUsers[i]["Approval to publish Potographs?"] === "Yes",
      // isVolunteerAgreementComplete:
      //   newUsers[i]["Volunteer Agreement Complete"] === "Yes",
      lastName: newUsers[i]["Last Name"],
      mobile: newUsers[i]["Mobile"].toString(),
      // occupation: newUsers[i]["Occupation"] ? newUsers[i]["Occupation"] : null,
      // policeCheckRenewalDate: newUsers[i]["Police Check Renewal Date"]
      //   ? new Date(newUsers[i]["Police Check Renewal Date"])
      //   : null,
      // vaccinationStatus: null,
      // WWCCheckNumber: newUsers[i]["WWC Check Number"]
      //   ? newUsers[i]["WWC Check Number"]
      //   : null,
      // WWCCheckRenewalDate: newUsers[i]["WWC Check Renewal Date"]
      //   ? new Date(newUsers[i]["WWC Check Renewal Date"])
      //   : null,
    });
  }

  try {
    await createManyUsersAsync(dbUsers);
  } catch (e: any) {
    console.error(e);

    return json({
      newUsers: [],
      responses: [],
      message: e.message,
    });
  }

  return json({
    newUsers,
    responses,
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
        <div>
          {actionData?.responses.map((r) => (
            <div key={r.id} className="card bg-error">
              <div className="card-body">
                <h2 className="card-title">Error!</h2>
                <pre>{JSON.stringify(r)}</pre>
              </div>
            </div>
          ))}
        </div>
      </Form>
    </>
  );
}
