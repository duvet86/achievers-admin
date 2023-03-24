import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import type { Prisma } from "@prisma/client";
import type { AzureUserWebAppWithRole } from "~/services";

import { json } from "@remix-run/node";
import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";

import invariant from "tiny-invariant";

import {
  getAzureUserWithRolesByIdAsync,
  getSessionUserAsync,
  isStringNullOrEmpty,
} from "~/services";

import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";

import Input from "~/components/Input";
import Title from "~/components/Title";
import DateInput from "~/components/DateInput";
import BackHeader from "~/components/BackHeader";

import {
  getUserByIdAsync,
  getProfilePictureUrl,
  saveProfilePicture,
  updateUserByIdAsync,
} from "./services.server";

import ProfileInput from "./ProfileInput";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  let azureUserInfo: AzureUserWebAppWithRole | null = null;
  if (user.azureADId !== null) {
    const sessionUser = await getSessionUserAsync(request);

    azureUserInfo = await getAzureUserWithRolesByIdAsync(
      sessionUser.accessToken,
      sessionUser.userId
    );
  }

  const profilePicturePath = user?.profilePicturePath
    ? await getProfilePictureUrl(user.profilePicturePath)
    : null;

  return json({
    user: {
      ...user,
      profilePicturePath,
    },
    azureUserInfo,
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

  const deleteProfilePicture = JSON.parse(
    formData.get("deleteProfilePicture") as string
  );

  const profilePictureFile = formData.get("profilePicture") as File | null;

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

  if (profilePictureFile && profilePictureFile.size > 0) {
    dataCreate.profilePicturePath = await saveProfilePicture(
      params.userId,
      profilePictureFile
    );
  } else if (deleteProfilePicture) {
    // TODO: delete picture in storage.
    dataCreate.profilePicturePath = null;
  }

  await updateUserByIdAsync(Number(params.userId), dataCreate);

  return json({
    message: null,
  });
}

export default function Chapter() {
  const transition = useNavigation();
  const { user, azureUserInfo } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full flex-col pb-28">
      <BackHeader />

      <Title>Edit info for "{user.email}"</Title>

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
              defaultValue={user?.addressStreet ?? ""}
              label="Address street"
              name="addressStreet"
              required
            />

            <Input
              defaultValue={user?.addressSuburb ?? ""}
              label="Address suburb"
              name="addressSuburb"
              required
            />

            <Input
              defaultValue={user?.addressState ?? ""}
              label="Address state"
              name="addressState"
              required
            />

            <Input
              defaultValue={user?.addressPostcode ?? ""}
              label="Address postcode"
              name="addressPostcode"
              required
            />

            <DateInput
              defaultValue={
                user && user.dateOfBirth ? new Date(user.dateOfBirth) : ""
              }
              label="Date of birth"
              name="dateOfBirth"
            />

            <Input
              defaultValue={user?.emergencyContactName ?? ""}
              label="Emergency Contact Name"
              name="emergencyContactName"
            />

            <Input
              defaultValue={user?.emergencyContactNumber ?? ""}
              label="Emergency Contact Number"
              name="emergencyContactNumber"
            />

            <Input
              defaultValue={user?.emergencyContactAddress ?? ""}
              label="Emergency Contact Address"
              name="emergencyContactAddress"
            />

            <Input
              defaultValue={user?.emergencyContactRelationship ?? ""}
              label="Emergency Contact Relationship"
              name="emergencyContactRelationship"
            />

            <Input
              defaultValue={user?.additionalEmail ?? ""}
              label="Additional email"
              name="additionalEmail"
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
                {azureUserInfo === null && (
                  <tr>
                    <td colSpan={2} className="border p-2">
                      <i>Mentor hasn't been invited into the system yet</i>
                    </td>
                  </tr>
                )}
                {azureUserInfo?.appRoleAssignments.length === 0 && (
                  <tr>
                    <td colSpan={2} className="border p-2">
                      <i>No Roles assigned to this user</i>
                    </td>
                  </tr>
                )}
                {azureUserInfo?.appRoleAssignments.map(({ id, roleName }) => (
                  <tr key={id}>
                    <td className="border p-2">
                      <span className="font-semibold">{roleName}</span>
                      <input type="hidden" name="roleIds" value={id} />
                    </td>
                    <td align="right" className="border p-2">
                      <Link
                        to={`roles/${id}/delete`}
                        className="btn-error btn-xs btn flex gap-2 align-middle"
                      >
                        <XMarkIcon className="mr-2 w-5" />
                        Remove
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="my-6 flex justify-end">
            {azureUserInfo === null ? (
              <button className="btn-primary btn gap-2" disabled>
                <PlusIcon className="w-6" />
                Assign a Role
              </button>
            ) : (
              <Link
                to="roles/assign"
                relative="path"
                className="btn-primary btn gap-2"
              >
                <PlusIcon className="w-6" />
                Assign a Role
              </Link>
            )}
          </div>

          <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />

          <div className="overflow-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th align="left" className="p-2">
                    Assigned to Chapter
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">
                    <span className="font-semibold">{user.chapter.name}</span>
                  </td>
                </tr>
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
