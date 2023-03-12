import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import type { Attendace, Prisma, VaccinationStatus } from "@prisma/client";

import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import {
  Form,
  Link,
  useCatch,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import invariant from "tiny-invariant";

import {
  getSessionUserAsync,
  getAzureUserWithRolesByIdAsync,
  isStringNullOrEmpty,
} from "~/services";

import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";

import Input from "~/components/Input";
import Title from "~/components/Title";
import Checkbox from "~/components/Checkbox";
import Select from "~/components/Select";
import DateInput from "~/components/DateInput";

import {
  getUserByIdAsync,
  updateUserByIdAsync,
  getUserAtChaptersByIdAsync,
  getProfilePictureUrl,
  saveProfilePicture,
} from "./services.server";
import ProfileInput from "./ProfileInput";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const sessionUser = await getSessionUserAsync(request);

  const [currentAzureUser, azureUser, user, userAtChapters] = await Promise.all(
    [
      getAzureUserWithRolesByIdAsync(
        sessionUser.accessToken,
        sessionUser.userId
      ),
      getAzureUserWithRolesByIdAsync(sessionUser.accessToken, params.userId),
      getUserByIdAsync(params.userId),
      getUserAtChaptersByIdAsync(params.userId),
    ]
  );

  const profilePicturePath = await getProfilePictureUrl(
    user?.profilePicturePath ?? undefined
  );

  const email = azureUser.mail ?? azureUser.userPrincipalName;

  return json({
    isLoggedUser: currentAzureUser.id === azureUser.id,
    user: {
      ...azureUser,
      ...user,
      chapters: userAtChapters.map(({ Chapter }) => Chapter),
      email,
      profilePicturePath,
    },
  });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.userId, "userId not found");

  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 500_000,
  });

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const additionalEmail = formData.get("additionalEmail")?.toString();
  const mobile = formData.get("mobile")?.toString();
  const address = formData.get("address")?.toString();
  const dateOfBirth = formData.get("dateOfBirth")?.toString();
  const isOver18 = Boolean(formData.get("isOver18")?.toString());
  const isPublishPhotoApproved = Boolean(
    formData.get("isPublishPhotoApproved")?.toString()
  );
  const isApprovedByMRC = Boolean(formData.get("isApprovedByMRC")?.toString());
  const isCommiteeMemeber = Boolean(
    formData.get("isCommiteeMemeber")?.toString()
  );
  const isCurrentMemeber = Boolean(
    formData.get("isCurrentMemeber")?.toString()
  );
  const inductionDate = formData.get("inductionDate")?.toString();
  const isActiveMentor = Boolean(formData.get("isActiveMentor")?.toString());
  const defaultAttendance = formData.get("attendance")
    ? (formData.get("attendance")?.toString() as Attendace)
    : null;
  const vaccinationStatus = formData
    .get("vaccinationStatus")
    ?.toString() as VaccinationStatus;
  const policeCheckRenewalDate = formData
    .get("policeCheckRenewalDate")
    ?.toString();
  const WWCCheckRenewalDate = formData.get("WWCCheckRenewalDate")?.toString();
  const WWCCheckNumber = formData.get("WWCCheckNumber")?.toString();
  const isVolunteerAgreementComplete = Boolean(
    formData.get("isVolunteerAgreementComplete")?.toString()
  );
  const isBoardMemeber = Boolean(formData.get("isBoardMemeber")?.toString());
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
  const occupation = formData.get("occupation")?.toString();
  const boardTermExpiryDate = formData.get("boardTermExpiryDate")?.toString();
  const directorIdentificationNumber = formData
    .get("directorIdentificationNumber")
    ?.toString();
  const endDate = formData.get("endDate")?.toString();

  const deleteProfilePicture = JSON.parse(
    formData.get("deleteProfilePicture") as string
  );

  if (
    isStringNullOrEmpty(firstName) ||
    isStringNullOrEmpty(lastName) ||
    isStringNullOrEmpty(mobile) ||
    isStringNullOrEmpty(address) ||
    isStringNullOrEmpty(dateOfBirth) ||
    isStringNullOrEmpty(emergencyContactName) ||
    isStringNullOrEmpty(emergencyContactNumber) ||
    isStringNullOrEmpty(emergencyContactAddress) ||
    isStringNullOrEmpty(emergencyContactRelationship)
  ) {
    return json({
      message: "Missing required fields",
    });
  }

  const dataCreate: Prisma.XOR<
    Prisma.UserCreateInput,
    Prisma.UserUncheckedCreateInput
  > = {
    id: params.userId,
    firstName,
    lastName,
    additionalEmail:
      !additionalEmail || additionalEmail.trim() === ""
        ? null
        : additionalEmail.trim(),
    mobile,
    address,
    dateOfBirth: new Date(dateOfBirth + "T00:00"),
    isOver18,
    isPublishPhotoApproved,
    isApprovedByMRC,
    isCommiteeMemeber,
    isCurrentMemeber,
    inductionDate: inductionDate ? new Date(inductionDate + "T00:00") : null,
    isActiveMentor,
    defaultAttendance,
    vaccinationStatus: vaccinationStatus ? vaccinationStatus : null,
    policeCheckRenewalDate: policeCheckRenewalDate
      ? new Date(policeCheckRenewalDate + "T00:00")
      : null,
    WWCCheckRenewalDate: WWCCheckRenewalDate
      ? new Date(WWCCheckRenewalDate + "T00:00")
      : null,
    WWCCheckNumber: WWCCheckNumber ? WWCCheckNumber : null,
    isVolunteerAgreementComplete,
    isBoardMemeber,
    emergencyContactName,
    emergencyContactNumber,
    emergencyContactAddress,
    emergencyContactRelationship,
    occupation: occupation ? occupation : null,
    boardTermExpiryDate: boardTermExpiryDate
      ? new Date(boardTermExpiryDate + "T00:00")
      : null,
    directorIdentificationNumber: directorIdentificationNumber
      ? directorIdentificationNumber
      : null,
    endDate: endDate ? new Date(endDate + "T00:00") : null,
  };

  const profilePictureFile = formData.get("profilePicture") as File | null;

  if (profilePictureFile && profilePictureFile.size > 0) {
    dataCreate.profilePicturePath = await saveProfilePicture(
      params.userId,
      profilePictureFile
    );
  } else if (deleteProfilePicture) {
    // TODO: delete picture in storage.
    dataCreate.profilePicturePath = null;
  }

  await updateUserByIdAsync(params.userId, dataCreate, dataCreate);

  return json({
    message: null,
  });
}

export default function Chapter() {
  const transition = useNavigation();
  const { user, isLoggedUser } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full flex-col pb-28">
      <div>
        <Link to="../" relative="path" className="btn-ghost btn mb-2 gap-2">
          <ArrowSmallLeftIcon className="w-6" />
          Back
        </Link>
      </div>

      <hr className="mb-4" />

      {isLoggedUser ? (
        <Title>Edit Profile</Title>
      ) : (
        <Title>Edit info for &ldquo;{user.email}&rdquo;</Title>
      )}

      <div className="flex h-full">
        <Form
          method="post"
          encType="multipart/form-data"
          className="relative mr-8 flex-1 overflow-y-auto border-r border-primary pr-4"
        >
          <fieldset disabled={transition.state === "submitting"}>
            <ProfileInput defaultValue={user.profilePicturePath} />

            <Input
              defaultValue={user.email}
              label="Email"
              name="email"
              disabled
            />

            <Input
              defaultValue={user?.firstName ?? ""}
              label="First name"
              name="firstName"
              required
            />

            <Input
              defaultValue={user?.lastName ?? ""}
              label="Last name"
              name="lastName"
              required
            />

            <Input
              defaultValue={user?.mobile ?? ""}
              type="number"
              label="Mobile"
              name="mobile"
              required
            />

            <Input
              defaultValue={user?.address ?? ""}
              label="Address"
              name="address"
              required
            />

            <DateInput
              defaultValue={
                user && user.dateOfBirth ? new Date(user.dateOfBirth) : ""
              }
              label="Date of birth"
              name="dateOfBirth"
              required
            />

            <Input
              defaultValue={user?.emergencyContactName ?? ""}
              label="Emergency Contact Name"
              name="emergencyContactName"
              required
            />

            <Input
              defaultValue={user?.emergencyContactNumber ?? ""}
              label="Emergency Contact Number"
              name="emergencyContactNumber"
              required
            />

            <Input
              defaultValue={user?.emergencyContactAddress ?? ""}
              label="Emergency Contact Address"
              name="emergencyContactAddress"
              required
            />

            <Input
              defaultValue={user?.emergencyContactRelationship ?? ""}
              label="Emergency Contact Relationship"
              name="emergencyContactRelationship"
              required
            />

            <Checkbox
              label="Is over 18?"
              name="isOver18"
              defaultChecked={user.isOver18 ?? false}
              required
            />

            <Checkbox
              label="Is Active Mentor"
              name="isActiveMentor"
              defaultChecked={user.isActiveMentor ?? true}
            />

            <Input
              defaultValue={user?.additionalEmail ?? ""}
              label="Additional email"
              name="additionalEmail"
            />

            <Checkbox
              label="Is Publish Photo Approved"
              name="isPublishPhotoApproved"
              defaultChecked={user.isPublishPhotoApproved ?? false}
            />

            <Checkbox
              label="Is Approved By MRC"
              name="isApprovedByMRC"
              defaultChecked={user.isApprovedByMRC ?? false}
            />

            <Checkbox
              label="Is Commitee Memeber"
              name="isCommiteeMemeber"
              defaultChecked={user.isCommiteeMemeber ?? false}
            />

            <Checkbox
              label="Is Current Memeber"
              name="isCurrentMemeber"
              defaultChecked={user.isCurrentMemeber ?? false}
            />

            <DateInput
              defaultValue={
                user && user.inductionDate ? new Date(user.inductionDate) : ""
              }
              label="Induction Date"
              name="inductionDate"
            />

            <Select
              defaultValue={user?.defaultAttendance ?? ""}
              label="Attendance"
              name="attendance"
              options={[
                { label: "Select an Attendance", value: "" },
                { label: "Weekly", value: "Weekly" },
                { label: "Fortnightly", value: "Fortnightly" },
                { label: "Other", value: "Other" },
              ]}
            />

            <Select
              defaultValue={user?.vaccinationStatus ?? ""}
              label="Vaccination Status"
              name="vaccinationStatus"
              options={[
                { label: "Select an Status", value: "" },
                { label: "Confirmed", value: "Confirmed" },
                { label: "Unconfirmed", value: "Unconfirmed" },
              ]}
            />

            <DateInput
              defaultValue={
                user && user.policeCheckRenewalDate
                  ? new Date(user.policeCheckRenewalDate)
                  : ""
              }
              label="Police Check Renewal Date"
              name="policeCheckRenewalDate"
            />

            <DateInput
              defaultValue={
                user && user.WWCCheckRenewalDate
                  ? new Date(user.WWCCheckRenewalDate)
                  : ""
              }
              label="WWC Check Renewal Date"
              name="WWCCheckRenewalDate"
            />

            <Input
              defaultValue={user?.WWCCheckNumber ?? ""}
              label="WWC Check Number"
              name="WWCCheckNumber"
            />

            <Checkbox
              label="Is Volunteer Agreement Complete"
              name="isVolunteerAgreementComplete"
              defaultChecked={user.isVolunteerAgreementComplete ?? false}
            />

            <Checkbox
              label="Is Board Memeber"
              name="isBoardMemeber"
              defaultChecked={user.isBoardMemeber ?? false}
            />

            <Input
              defaultValue={user?.occupation ?? ""}
              label="Occupation"
              name="occupation"
            />

            <DateInput
              defaultValue={
                user && user.boardTermExpiryDate
                  ? new Date(user.boardTermExpiryDate)
                  : ""
              }
              label="Board Term Expiry Date"
              name="boardTermExpiryDate"
            />

            <Input
              defaultValue={user?.directorIdentificationNumber ?? ""}
              label="Director Identification Number"
              name="directorIdentificationNumber"
            />

            <DateInput
              defaultValue={user && user.endDate ? new Date(user.endDate) : ""}
              label="End Date"
              name="endDate"
            />

            <button
              className="btn-primary btn sticky bottom-0 float-right mt-6 w-28"
              type="submit"
            >
              Save
            </button>
          </fieldset>
        </Form>

        <div className="flex-1">
          <div className="overflow-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th align="left" className="p-2">
                    Roles
                  </th>
                  <th align="right" className="p-2">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {user.appRoleAssignments.length === 0 && (
                  <tr>
                    <td colSpan={2} className="border p-2">
                      <i>No Roles assigned to this user</i>
                    </td>
                  </tr>
                )}
                {user.appRoleAssignments.map(({ id, roleName }) => (
                  <tr key={id}>
                    <td className="border p-2">
                      <span className="font-semibold">{roleName}</span>
                      <input type="hidden" name="roleIds" value={id} />
                    </td>
                    <td align="right" className="border p-2">
                      <Link
                        to={`roles/${id}/delete`}
                        className="flex w-32 items-center justify-center rounded bg-red-600 px-3 py-1 text-white"
                      >
                        <XMarkIcon className="mr-2 w-5" />
                        <span>Remove</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="my-6 flex justify-end">
            <Link
              to="roles/assign"
              relative="path"
              className="btn-primary btn gap-2"
            >
              <PlusIcon className="w-6" />
              Assign a Role
            </Link>
          </div>

          <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />

          <div className="overflow-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th align="left" className="p-2">
                    Assigned to Chapter
                  </th>
                  <th align="right" className="p-2">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {user.chapters.length === 0 && (
                  <tr>
                    <td colSpan={2} className="border p-2">
                      <i>No chapters assigned to this user</i>
                    </td>
                  </tr>
                )}

                {user.chapters.map(({ id, name }) => (
                  <tr key={id}>
                    <td className="border p-2">
                      <span className="font-semibold">{name}</span>
                      <input type="hidden" name="chapterIds" value={id} />
                    </td>
                    <td align="right" className="border p-2">
                      <Link
                        to={`chapters/${id}/delete`}
                        className="flex w-32 items-center justify-center rounded bg-red-600 px-3 py-1 text-white"
                      >
                        <XMarkIcon className="mr-2 w-5" />
                        <span>Remove</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <Link
              to="chapters/assign"
              relative="path"
              className="btn-primary btn gap-2"
            >
              <PlusIcon className="w-6" />
              Assign to a Chapter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <div className="card bg-error">
      <div className="card-body">
        <h2 className="card-title">Error!</h2>
        <pre>{error.message}</pre>
      </div>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
