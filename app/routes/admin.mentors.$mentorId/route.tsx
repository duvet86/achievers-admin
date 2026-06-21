import type { Route } from "./+types/route";
import type { MentorCommand } from "./services.server";

import invariant from "tiny-invariant";
import { NavArrowRight } from "iconoir-react";
import { parseFormData } from "@mjackson/form-data-parser";

import {
  deleteUserProfilePicture,
  getUserProfilePictureUrl,
  memoryHandlerDispose,
  saveUserProfilePicture,
  uploadHandler,
} from "~/services/.server";
import { isDateExpired, isStringNullOrEmpty, URLSafeSearch } from "~/services";
import { StateLink } from "~/components";

import {
  getUserByIdAsync,
  updateMentorByIdAsync,
  getChaptersAsync,
  removeWelcomeCall,
  removeInduction,
  removePoliceCheck,
  removeWwccheck,
  removeApprovalMrc,
  parseGender,
} from "./services.server";
import { UserForm, CheckList, Header } from "./components";

export async function loader({ request, params }: Route.LoaderArgs) {
  invariant(params.mentorId, "mentorId not found");

  const safeUrl = new URLSafeSearch(request.url);

  const isFormEditable =
    safeUrl.safeSearchParams.getNullOrEmpty("isFormEditable") ?? false;

  const user = await getUserByIdAsync(Number(params.mentorId));

  const profilePicturePath = user?.profilePicturePath
    ? getUserProfilePictureUrl(user.profilePicturePath)
    : null;

  const chapters = await getChaptersAsync();

  return {
    isFormEditable: Boolean(isFormEditable),
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
    references: user.references,
    inductionCompleted: user.induction !== null,
    policeCheckCompleted: user.policeCheck !== null,
    wwcCheckCompleted: user.wwcCheck !== null,
    approvalbyMRCCompleted: user.approvalbyMRC !== null,
    volunteerAgreementSignedOn: user.volunteerAgreementSignedOn,
    hasAccess: user.azureADId !== null,
    chapters,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.mentorId, "mentorId not found");

  if (request.method === "DELETE") {
    const formDataDelete = await request.formData();

    const action = formDataDelete.get("action")!.toString();
    switch (action) {
      case "welcomeCall":
        await removeWelcomeCall(Number(params.mentorId));
        break;

      case "induction":
        await removeInduction(Number(params.mentorId));
        break;

      case "police-check":
        await removePoliceCheck(Number(params.mentorId));
        break;

      case "wwc-check":
        await removeWwccheck(Number(params.mentorId));
        break;

      case "approval-mrc":
        await removeApprovalMrc(Number(params.mentorId));
        break;
    }

    return {
      successMessage: "Deleted successfully!",
      errorMessage: null,
    };
  }

  const formData = await parseFormData(request, uploadHandler);

  const profilePicture = formData.get("profilePicture");
  if (profilePicture === "DELETE") {
    await deleteUserProfilePicture(Number(params.mentorId));

    return {
      successMessage: "Profile picture deleted successfully!",
      errorMessage: null,
    };
  } else if (profilePicture instanceof File) {
    await saveUserProfilePicture(Number(params.mentorId), profilePicture);

    memoryHandlerDispose("profilePicture");

    return {
      successMessage: "Profile picture updated successfully!",
      errorMessage: null,
    };
  }

  const chapterId = formData.get("chapterId")?.toString();
  const note = formData.get("note")?.toString();
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
  const gender = parseGender(formData.get("gender")?.toString());
  const hasApprovedToPublishPhotos = formData
    .get("hasApprovedToPublishPhotos")
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

  const dataCreate: MentorCommand = {
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
    emergencyContactName: emergencyContactName ?? null,
    emergencyContactNumber: emergencyContactNumber ?? null,
    emergencyContactAddress: emergencyContactAddress ?? null,
    emergencyContactRelationship: emergencyContactRelationship ?? null,
    chapterId: Number(chapterId),
    preferredName: isStringNullOrEmpty(preferredName) ? null : preferredName,
    note: isStringNullOrEmpty(note) ? null : note,
    frequencyInDays:
      frequency === "FORTNIGHTLY" ? 14 : frequency === "WEEKLY" ? 7 : null,
    hasApprovedToPublishPhotos: hasApprovedToPublishPhotos === "true",

    gender: gender,
  };

  await updateMentorByIdAsync(Number(params.mentorId), dataCreate, email);

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
        hasAccess={loaderData.hasAccess}
      />

      <hr className="my-4" />

      <div className="content-area md:flex">
        <UserForm
          isFormEditable={loaderData.isFormEditable}
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
            references={loaderData.references}
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
