import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import type { Attendace, VaccinationStatus } from "@prisma/client";

import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import invariant from "tiny-invariant";

import { getSessionUserAsync } from "~/session.server";

import { getUserByIdAsync, updateUserByIdAsync } from "~/services/user.server";
import { getAssignedChaptersToUserAsync } from "~/services/chapter.server";
import { getAzureUserWithRolesByIdAsync } from "~/services/azure.server";
import { isStringNullOrEmpty } from "~/services/string-utils.server";

import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";

import Input from "~/components/Input";
import Title from "~/components/Title";
import Checkbox from "~/components/Checkbox";
import Select from "~/components/Select";
import DateInput from "~/components/DateInput";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const [sessionUser, azureUser, user, assignedChapters] = await Promise.all([
    getSessionUserAsync(request),
    getAzureUserWithRolesByIdAsync(params.userId),
    getUserByIdAsync(params.userId),
    getAssignedChaptersToUserAsync(params.userId),
  ]);

  const email = azureUser?.mail ?? azureUser?.userPrincipalName;

  return json({
    isLoggedUser: sessionUser?.id === azureUser.id,
    user: {
      ...azureUser,
      ...user,
      email,
      assignedChapters,
    },
  });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.userId, "userId not found");

  const formData = await request.formData();

  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const additionalEmail = formData.get("additionalEmail")?.toString();
  const mobile = formData.get("mobile")?.toString();
  const address = formData.get("address")?.toString();
  const dateOfBirth = formData.get("dateOfBirth")?.toString();
  const isOver18 = Boolean(formData.get("isOver18"));
  const isPublishPhotoApproved = Boolean(
    formData.get("isPublishPhotoApproved")
  );
  const isApprovedByMRC = Boolean(formData.get("isApprovedByMRC"));
  const isCommiteeMemeber = Boolean(formData.get("isCommiteeMemeber"));
  const isCurrentMemeber = Boolean(formData.get("isCurrentMemeber"));
  const inductionDate = formData.get("inductionDate")?.toString();
  const isActiveMentor = Boolean(formData.get("isActiveMentor"));
  const attendance = formData.get("attendance")?.toString() as Attendace;
  const vaccinationStatus = formData
    .get("vaccinationStatus")
    ?.toString() as VaccinationStatus;
  const policeCheckRenewalDate = formData
    .get("policeCheckRenewalDate")
    ?.toString();
  const WWCCheckRenewalDate = formData.get("WWCCheckRenewalDate")?.toString();
  const WWCCheckNumber = formData.get("WWCCheckNumber")?.toString();
  const isVolunteerAgreementComplete = Boolean(
    formData.get("isVolunteerAgreementComplete")
  );
  const isBoardMemeber = Boolean(formData.get("isBoardMemeber"));
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

  await updateUserByIdAsync(params.userId, {
    firstName,
    lastName,
    additionalEmail,
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
    attendance,
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
  });

  return json({
    message: null,
  });
}

export default function Chapter() {
  const { user, isLoggedUser } = useLoaderData<typeof loader>();

  return (
    <>
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

      <div className="flex">
        <Form
          method="post"
          className="mr-8 flex-1 border-r border-primary pr-4"
        >
          <Input
            defaultValue={user?.firstName || ""}
            label="First name"
            name="firstName"
            required
          />

          <Input
            defaultValue={user?.lastName || ""}
            label="Last name"
            name="lastName"
            required
          />

          <Input
            defaultValue={user.email}
            label="Email"
            name="email"
            readOnly
          />

          <Input
            defaultValue={user?.additionalEmail || ""}
            label="Additional email"
            name="additionalEmail"
          />

          <Input
            defaultValue={user?.mobile || ""}
            label="Mobile"
            name="mobile"
            required
          />

          <Input
            defaultValue={user?.address || ""}
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

          <Checkbox
            label="Is over 18?"
            name="isOver18"
            defaultChecked={user.isOver18 ?? false}
            required
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

          <Checkbox
            label="Is Active Mentor"
            name="isActiveMentor"
            defaultChecked={user.isActiveMentor ?? false}
          />

          <Select
            defaultValue={user?.attendance || ""}
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
            defaultValue={user?.vaccinationStatus || ""}
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
            defaultValue={user?.WWCCheckNumber || ""}
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
            defaultValue={user?.emergencyContactName || ""}
            label="Emergency Contact Name"
            name="emergencyContactName"
            required
          />

          <Input
            defaultValue={user?.emergencyContactNumber || ""}
            label="Emergency Contact Number"
            name="emergencyContactNumber"
            required
          />

          <Input
            defaultValue={user?.emergencyContactAddress || ""}
            label="Emergency Contact Address"
            name="emergencyContactAddress"
            required
          />

          <Input
            defaultValue={user?.emergencyContactRelationship || ""}
            label="Emergency Contact Relationship"
            name="emergencyContactRelationship"
            required
          />

          <Input
            defaultValue={user?.occupation || ""}
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
            defaultValue={user?.directorIdentificationNumber || ""}
            label="Director Identification Number"
            name="directorIdentificationNumber"
          />

          <DateInput
            defaultValue={user && user.endDate ? new Date(user.endDate) : ""}
            label="End Date"
            name="endDate"
          />

          <button
            className="btn-primary btn float-right mt-6 w-28"
            type="submit"
          >
            Save
          </button>
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
                {user.assignedChapters.length === 0 && (
                  <tr>
                    <td colSpan={2} className="border p-2">
                      <i>No Chapters assigned to this user</i>
                    </td>
                  </tr>
                )}
                {user.assignedChapters.map(({ chapter: { id, name } }) => (
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
    </>
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
