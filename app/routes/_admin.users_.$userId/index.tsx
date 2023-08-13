import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import type { Prisma } from "@prisma/client";
import type { AzureUserWebAppWithRole } from "~/services";

import { json } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";

import invariant from "tiny-invariant";

import {
  getAzureUserWithRolesByIdAsync,
  isStringNullOrEmpty,
  Roles,
} from "~/services";

import {
  getUserByIdAsync,
  getProfilePictureUrl,
  updateUserByIdAsync,
} from "./services.server";

import { EditUserInfoForm } from "./EditUserInfoForm";
import { ChaptersForm } from "./ChaptersForm";
import { CheckList } from "./CheckList";
import { Header } from "./Header";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));
  if (user === null) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  let azureUserInfo: AzureUserWebAppWithRole | null = null;
  if (user.azureADId !== null) {
    azureUserInfo = await getAzureUserWithRolesByIdAsync(
      request,
      user.azureADId,
    );
  }

  const profilePicturePath = user?.profilePicturePath
    ? await getProfilePictureUrl(user.profilePicturePath)
    : null;

  return json({
    user,
    profilePicturePath,
    welcomeCallCompleted: user.welcomeCall !== null,
    referencesCompleted:
      user.references.filter((ref) => ref.calledOndate !== null).length >= 2,
    inductionCompleted: user.induction !== null,
    policeCheckCompleted: user.policeCheck !== null,
    wwcCheckCompleted: user.wwcCheck !== null,
    approvalbyMRCCompleted: user.approvalbyMRC !== null,
    volunteerAgreementSignedOn: user.volunteerAgreementSignedOn,
    mentorAppRoleAssignmentId:
      azureUserInfo?.appRoleAssignments.find(
        ({ appRoleId }) => Roles.Mentor === appRoleId,
      )?.id ?? null,
  });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.userId, "userId not found");

  const formData = await request.formData();

  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const mobile = formData.get("mobile")?.toString();

  const addressStreet = formData.get("addressStreet")?.toString();
  const addressSuburb = formData.get("addressSuburb")?.toString();
  const addressState = formData.get("addressState")?.toString();
  const addressPostcode = formData.get("addressPostcode")?.toString();

  const dateOfBirth = formData.get("dateOfBirth")?.toString();
  const additionalEmail = formData.get("additionalEmail")?.toString();

  const emergencyContactName = formData.get("emergencyContactName")?.toString();
  const emergencyContactNumber = formData
    .get("emergencyContactNumber")
    ?.toString();
  const emergencyContactAddress = formData
    .get("emergencyContactAddress")
    ?.toString();
  const emergencyContactRelationship = formData
    .get("emergencyContactRelationship")
    ?.toString();

  if (
    isStringNullOrEmpty(firstName) ||
    isStringNullOrEmpty(lastName) ||
    isStringNullOrEmpty(mobile) ||
    isStringNullOrEmpty(addressStreet) ||
    isStringNullOrEmpty(addressSuburb) ||
    isStringNullOrEmpty(addressState) ||
    isStringNullOrEmpty(addressPostcode)
  ) {
    return json({
      message: "Missing required fields",
    });
  }

  const dataCreate: Prisma.XOR<
    Prisma.UserUpdateInput,
    Prisma.UserUncheckedUpdateInput
  > = {
    firstName,
    lastName,
    mobile,
    addressStreet,
    addressSuburb,
    addressState,
    addressPostcode,
    additionalEmail:
      additionalEmail === undefined || additionalEmail.trim() === ""
        ? null
        : additionalEmail.trim(),
    dateOfBirth:
      dateOfBirth === undefined ? null : new Date(dateOfBirth + "T00:00"),
    emergencyContactName,
    emergencyContactNumber,
    emergencyContactAddress,
    emergencyContactRelationship,
  };

  await updateUserByIdAsync(Number(params.userId), dataCreate);

  return json({
    message: null,
  });
}

export default function Chapter() {
  const loaderData = useLoaderData<typeof loader>();
  const transition = useNavigation();

  return (
    <div className="flex h-full flex-col">
      <Header
        mentorAppRoleAssignmentId={loaderData.mentorAppRoleAssignmentId}
      />

      <div className="h-full md:flex">
        <EditUserInfoForm loaderData={loaderData} transition={transition} />

        <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700 md:hidden" />

        <div className="flex-1 overflow-y-auto">
          <CheckList loaderData={loaderData} />

          <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />

          <ChaptersForm loaderData={loaderData} />
        </div>
      </div>
    </div>
  );
}
