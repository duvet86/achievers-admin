import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { Prisma } from "@prisma/client";
import type { AzureUserWebAppWithRole } from "~/services/.server";

import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation } from "@remix-run/react";

import invariant from "tiny-invariant";

import {
  getAzureUserWithRolesByIdAsync,
  ROLE_MAPPINGS,
} from "~/services/.server";
import { isDateExpired, isStringNullOrEmpty } from "~/services";

import {
  getUserByIdAsync,
  getProfilePictureUrl,
  updateUserByIdAsync,
  getChaptersAsync,
} from "./services.server";

import { UserForm } from "./components/UserForm";
import { CheckList } from "./components/CheckList";
import { Header } from "./components/Header";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  let azureUserInfo: AzureUserWebAppWithRole | null = null;
  if (user.azureADId !== null) {
    azureUserInfo = await getAzureUserWithRolesByIdAsync(
      request,
      user.azureADId,
    );
  }

  console.log("azureUserInfo", azureUserInfo);

  const profilePicturePath = user?.profilePicturePath
    ? getProfilePictureUrl(user.profilePicturePath)
    : null;

  const chapters = await getChaptersAsync();

  return json({
    user,
    isWwcCheckExpired: isDateExpired(user.wwcCheck?.expiryDate),
    isPoliceCheckExpired: isDateExpired(user.policeCheck?.expiryDate),
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
        ({ appRoleId }) => ROLE_MAPPINGS.Mentor === appRoleId,
      )?.id ?? null,
    chapters,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.userId, "userId not found");

  const formData = await request.formData();

  const chapterId = formData.get("chapterId")?.toString();
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
      successMessage: null,
      errorMessage: "Missing required fields",
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
    additionalEmail: isStringNullOrEmpty(additionalEmail)
      ? null
      : additionalEmail.trim(),
    dateOfBirth: isStringNullOrEmpty(dateOfBirth)
      ? null
      : new Date(dateOfBirth + "T00:00"),
    emergencyContactName,
    emergencyContactNumber,
    emergencyContactAddress,
    emergencyContactRelationship,
    chapterId: Number(chapterId),
  };

  await updateUserByIdAsync(Number(params.userId), dataCreate);

  return json({
    successMessage: "User successfully saved!",
    errorMessage: null,
  });
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const transition = useNavigation();

  return (
    <div className="flex h-full flex-col">
      <div className="h-48 lg:h-16">
        <Header
          endDate={loaderData.user.endDate}
          mentorAppRoleAssignmentId={loaderData.mentorAppRoleAssignmentId}
        />
      </div>

      <hr className="my-4" />

      <div className="content-area md:flex">
        <UserForm
          loaderData={loaderData}
          actionData={actionData}
          transition={transition}
        />

        <hr className="my-8 md:hidden" />

        <div className="flex-1 overflow-y-auto">
          <CheckList loaderData={loaderData} />
        </div>
      </div>
    </div>
  );
}
