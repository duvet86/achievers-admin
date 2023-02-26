import type { ActionArgs, TypedResponse } from "@remix-run/server-runtime";
import type { Prisma } from "@prisma/client";
import type { SpeadsheetUser } from "~/models/speadsheet";
import type { AzureInviteResponse, AzureUser } from "~/services/azure.server";

import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  json,
  redirect,
} from "@remix-run/server-runtime";
import { Form, Link, useActionData, useTransition } from "@remix-run/react";

import { readExcelFileAsync } from "~/services/read-excel-file.server";
import {
  getAzureUsersAsync,
  inviteUserToAzureAsync,
  WEB_APP_URL,
} from "~/services/azure.server";
import { createManyUsersAsync } from "~/services/user.server";

import ArrowUpTrayIcon from "@heroicons/react/24/solid/ArrowUpTrayIcon";

import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";

import LoadingSpinner from "~/components/LoadingSpinner";
import Title from "~/components/Title";

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
  if (!file) {
    return json({
      newUsers: [],
      responses: [],
      message: "Choose a file",
    });
  }

  let azureUsers: AzureUser[] = [];
  let newUsers: SpeadsheetUser[] = [];

  const dbUsers: Prisma.UserCreateManyInput[] = [];
  const responses: AzureInviteResponse[] = [];
  try {
    azureUsers = await getAzureUsersAsync();
    const fileUsers = await readExcelFileAsync(file as File);

    const azureUsersLookup = azureUsers.reduce<Record<string, string>>(
      (res, { displayName }) => {
        res[displayName.toLowerCase()] = displayName;

        return res;
      },
      {}
    );

    newUsers = fileUsers.filter(
      (fileUser) =>
        azureUsersLookup[
          `${fileUser["First Name"]} ${fileUser["Last Name"]}`.toLowerCase()
        ] === undefined
    );

    for (let i = 0; i < newUsers.length; i++) {
      const response = await inviteUserToAzureAsync({
        invitedUserEmailAddress: newUsers[i]["Email address"],
        inviteRedirectUrl: WEB_APP_URL,
        sendInvitationMessage: true,
      });

      responses.push(response);

      dbUsers.push({
        address: newUsers[i]["Residential Address"],
        additionalEmail: newUsers[i][
          "Additional email addresses (for intranet access)"
        ]
          ? newUsers[i]["Additional email addresses (for intranet access)"]
          : null,
        attendance: newUsers[i]["Attendance"]
          ? newUsers[i]["Attendance"]
          : null,
        boardTermExpiryDate: newUsers[i]["Board Term Expiry"]
          ? new Date(newUsers[i]["Board Term Expiry"])
          : null,
        dateOfBirth: new Date(newUsers[i]["Date of Birth"]),
        directorIdentificationNumber: newUsers[i][
          "Director Identification Number"
        ]
          ? newUsers[i]["Director Identification Number"]
          : null,
        email: newUsers[i]["Email address"],
        emergencyContactAddress: newUsers[i]["Emergency Contact Address"],
        emergencyContactName: newUsers[i]["Emergency Contact Name"],
        emergencyContactNumber: newUsers[i]["Emergency Contact Name"],
        emergencyContactRelationship:
          newUsers[i]["Emergency Contact Relationship"],
        endDate: newUsers[i]["End Date"]
          ? new Date(newUsers[i]["End Date"])
          : null,
        firstName: newUsers[i]["First Name"],
        id: response.invitedUser.id,
        inductionDate: newUsers[i]["Induction Date"]
          ? new Date(newUsers[i]["Induction Date"])
          : newUsers[i]["Induction Date"],
        isActiveMentor: newUsers[i]["Active Mentor"] === "Yes",
        isApprovedByMRC: newUsers[i]["Approved by MRC?"] === "Yes",
        isBoardMemeber: newUsers[i]["Board Member"] === "Yes",
        isCommiteeMemeber: newUsers[i]["Committee Member"] === "Yes",
        isCurrentMemeber: newUsers[i]["Current Member"] === "Yes",
        isOver18: newUsers[i]["Over the age of 18 years?"] === "Yes",
        isPublishPhotoApproved:
          newUsers[i]["Approval to publish Potographs?"] === "Yes",
        isVolunteerAgreementComplete:
          newUsers[i]["Volunteer Agreement Complete"] === "Yes",
        lastName: newUsers[i]["Last Name"],
        mobile: newUsers[i]["Mobile"].toString(),
        occupation: newUsers[i]["Occupation"]
          ? newUsers[i]["Occupation"]
          : null,
        policeCheckRenewalDate: newUsers[i]["Police Check Renewal Date"]
          ? new Date(newUsers[i]["Police Check Renewal Date"])
          : null,
        vaccinationStatus: null,
        WWCCheckNumber: newUsers[i]["WWC Check Number"]
          ? newUsers[i]["WWC Check Number"]
          : null,
        WWCCheckRenewalDate: newUsers[i]["WWC Check Renewal Date"]
          ? new Date(newUsers[i]["WWC Check Renewal Date"])
          : null,
      });
    }
  } catch (e) {
    console.error(e);
    throw redirect("/logout");
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

export default function ImportFromFile() {
  const data = useActionData<typeof action>();
  const transition = useTransition();

  const isLoading = transition.state === "loading";
  const isSubmitting = transition.state === "submitting";

  const isDisabled = isLoading || isSubmitting;

  return (
    <>
      <div>
        <Link to="../" relative="path" className="btn-ghost btn mb-2 gap-2">
          <ArrowSmallLeftIcon className="w-6" />
          Back
        </Link>
      </div>

      <hr className="mb-4" />

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
          <label className="label">
            <span className="label-text-alt">{data?.message}</span>
          </label>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="btn-primary btn gap-2"
            disabled={isDisabled}
          >
            <ArrowUpTrayIcon className="h-6 w-6" />
            Import
          </button>
          {isDisabled && <LoadingSpinner dark />}
        </div>
        <div className="text-info">
          {!data?.message && data?.newUsers.length === 0 && (
            <p>No new users to import.</p>
          )}
        </div>
        <div className="ml-4">
          {data?.newUsers.map((u, index) => (
            <ul key={index} className="list-disc">
              <li>{u["First Name"]}</li>
              <li>{u["Last Name"]}</li>
              <li>{u["Email address"]}</li>
            </ul>
          ))}
        </div>
        <div>
          {data?.responses.map((r) => (
            <p key={r.id}>{JSON.stringify(r)}</p>
          ))}
        </div>
      </Form>
    </>
  );
}
