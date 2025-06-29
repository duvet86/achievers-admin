import type { Prisma } from "~/prisma/client";
import type { XOR } from "~/models";
import type { AzureUserWebAppWithRole } from "~/services/.server";
import type { Route } from "./+types/route";

import invariant from "tiny-invariant";
import { NavArrowRight } from "iconoir-react";
import { parseFormData } from "@mjackson/form-data-parser";

import {
  deleteUserProfilePicture,
  getAzureUserWithRolesByIdAsync,
  getUserProfilePictureUrl,
  memoryHandlerDispose,
  saveUserProfilePicture,
  uploadHandler,
} from "~/services/.server";
import { isDateExpired, isStringNullOrEmpty } from "~/services";
import { StateLink } from "~/components";

import {
  getUserByIdAsync,
  updateUserByIdAsync,
  getChaptersAsync,
} from "./services.server";
import { UserForm, CheckList, Header } from "./components";

export async function loader({ request, params }: Route.LoaderArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  let azureUserInfo: AzureUserWebAppWithRole | null = null;
  if (user.azureADId !== null) {
    azureUserInfo = await getAzureUserWithRolesByIdAsync(
      request,
      user.azureADId,
    );
  }

  const profilePicturePath = user?.profilePicturePath
    ? getUserProfilePictureUrl(user.profilePicturePath)
    : null;

  const chapters = await getChaptersAsync();

  return {
    user: {
      ...user,
      profilePicturePath,
      frequency:
        user.frequencyInDays === 14
          ? "FORTNIGHTLY"
          : user.frequencyInDays === 7
            ? "WEEKLY"
            : "",
    },
    isWwcCheckExpired: isDateExpired(user.wwcCheck?.expiryDate),
    isPoliceCheckExpired: isDateExpired(user.policeCheck?.expiryDate),
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
        ({ roleName }) => roleName === "Mentor",
      )?.id ?? null,
    chapters,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.userId, "userId not found");

  const formData = await parseFormData(request, uploadHandler);

  const profilePicure = formData.get("profilePicure");
  if (profilePicure === "DELETE") {
    await deleteUserProfilePicture(Number(params.userId));

    return {
      successMessage: "Profile picture deleted successfully!",
      errorMessage: null,
    };
  } else if (profilePicure instanceof File) {
    await saveUserProfilePicture(Number(params.userId), profilePicure);

    memoryHandlerDispose("profilePicure");

    return {
      successMessage: "Profile picture updated successfully!",
      errorMessage: null,
    };
  }

  const chapterId = formData.get("chapterId")?.toString();
  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const preferredName = formData.get("preferredName")?.toString();
  const email = formData.get("email")?.toString();
  const mobile = formData.get("mobile")?.toString();

  const addressStreet = formData.get("addressStreet")?.toString();
  const addressSuburb = formData.get("addressSuburb")?.toString();
  const addressState = formData.get("addressState")?.toString();
  const addressPostcode = formData.get("addressPostcode")?.toString();

  const dateOfBirth = formData.get("dateOfBirth")?.toString();
  const additionalEmail = formData.get("additionalEmail")?.toString();

  const frequency = formData.get("frequency")!.toString();

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
    throw new Error("Missing required fields.");
  }

  const dataCreate: XOR<
    Prisma.UserUpdateInput,
    Prisma.UserUncheckedUpdateInput
  > = {
    firstName,
    lastName,
    email,
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
    preferredName,
    frequencyInDays:
      frequency === "FORTNIGHTLY" ? 14 : frequency === "WEEKLY" ? 7 : null,
  };

  await updateUserByIdAsync(Number(params.userId), dataCreate);

  return {
    successMessage: "User successfully saved!",
    errorMessage: null,
  };
}

export default function Index({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <div className="flex h-full flex-col">
      <Header
        chapterId={loaderData.user.chapterId}
        mentorId={loaderData.user.id}
        endDate={loaderData.user.endDate}
        mentorAppRoleAssignmentId={loaderData.mentorAppRoleAssignmentId}
      />

      <hr className="my-4" />

      <div className="content-area md:flex">
        <UserForm
          user={loaderData.user}
          chapters={loaderData.chapters}
          successMessage={actionData?.successMessage}
        />

        <hr className="my-8 md:hidden" />

        <div className="flex-1 overflow-y-auto">
          <CheckList
            approvalbyMRCCompleted={loaderData.approvalbyMRCCompleted}
            inductionCompleted={loaderData.inductionCompleted}
            isPoliceCheckExpired={loaderData.isPoliceCheckExpired}
            isWwcCheckExpired={loaderData.isWwcCheckExpired}
            policeCheckCompleted={loaderData.policeCheckCompleted}
            referencesCompleted={loaderData.referencesCompleted}
            volunteerAgreementSignedOn={loaderData.volunteerAgreementSignedOn}
            welcomeCallCompleted={loaderData.welcomeCallCompleted}
            wwcCheckCompleted={loaderData.wwcCheckCompleted}
          />

          <hr className="my-4" />

          <div>
            <StateLink
              className="btn"
              to={`/admin/chapters/${loaderData.user.chapterId}/mentors/${loaderData.user.id}`}
            >
              Assign students <NavArrowRight />
            </StateLink>
          </div>
        </div>
      </div>
    </div>
  );
}
