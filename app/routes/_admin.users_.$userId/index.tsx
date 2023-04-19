import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import type { Prisma } from "@prisma/client";
import type { AzureUserWebAppWithRole } from "~/services";

import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";

import invariant from "tiny-invariant";

import {
  getAzureUserWithRolesByIdAsync,
  getSessionUserAsync,
  isStringNullOrEmpty,
} from "~/services";

import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";
import HomeModernIcon from "@heroicons/react/24/solid/HomeModernIcon";
import EnvelopeIcon from "@heroicons/react/24/solid/EnvelopeIcon";
import UserCircleIcon from "@heroicons/react/24/solid/UserCircleIcon";
import PhoneIcon from "@heroicons/react/24/solid/PhoneIcon";
import ChatBubbleLeftRightIcon from "@heroicons/react/24/solid/ChatBubbleLeftRightIcon";
import NewspaperIcon from "@heroicons/react/24/solid/NewspaperIcon";
import ShieldCheckIcon from "@heroicons/react/24/solid/ShieldCheckIcon";
import UserGroupIcon from "@heroicons/react/24/solid/UserGroupIcon";
import CheckIcon from "@heroicons/react/24/solid/CheckIcon";
import PencilIcon from "@heroicons/react/24/solid/PencilIcon";

import {
  Input,
  Title,
  DateInput,
  BackHeader,
  SubmitFormButton,
} from "~/components";

import {
  getUserByIdAsync,
  getProfilePictureUrl,
  updateUserByIdAsync,
} from "./services.server";

import ProfilePicture from "./ProfilePicture";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  let azureUserInfo: AzureUserWebAppWithRole | null = null;
  if (user.azureADId !== null) {
    const sessionUser = await getSessionUserAsync(request);

    azureUserInfo = await getAzureUserWithRolesByIdAsync(
      sessionUser.accessToken,
      user.azureADId
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
  const transition = useNavigation();
  const { user, azureUserInfo } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full flex-col pb-28">
      <BackHeader />

      <Title>
        Edit info for "{user.firstName} {user.lastName}"
      </Title>

      <div className="flex h-full">
        <Form
          method="post"
          className="relative mr-8 flex-1 overflow-y-auto border-r border-primary pr-4"
        >
          <fieldset disabled={transition.state === "submitting"}>
            <ProfilePicture profilePicturePath={user.profilePicturePath} />

            <Input
              type="email"
              defaultValue={user.email}
              label="Email"
              name="email"
              disabled
            />

            <Input
              defaultValue={user.firstName ?? ""}
              label="First name"
              name="firstName"
              required
            />

            <Input
              defaultValue={user.lastName ?? ""}
              label="Last name"
              name="lastName"
              required
            />

            <Input
              defaultValue={user.mobile ?? ""}
              type="number"
              label="Mobile"
              name="mobile"
              required
            />

            <Input
              defaultValue={user.addressStreet ?? ""}
              label="Address street"
              name="addressStreet"
              required
            />

            <Input
              defaultValue={user.addressSuburb ?? ""}
              label="Address suburb"
              name="addressSuburb"
              required
            />

            <Input
              defaultValue={user.addressState ?? ""}
              label="Address state"
              name="addressState"
              required
            />

            <Input
              defaultValue={user.addressPostcode ?? ""}
              label="Address postcode"
              name="addressPostcode"
              required
            />

            <DateInput
              defaultValue={user.dateOfBirth ?? ""}
              label="Date of birth"
              name="dateOfBirth"
            />

            <Input
              defaultValue={user.emergencyContactName ?? ""}
              label="Emergency contact name"
              name="emergencyContactName"
            />

            <Input
              defaultValue={user.emergencyContactNumber ?? ""}
              label="Emergency contact number"
              name="emergencyContactNumber"
            />

            <Input
              defaultValue={user.emergencyContactAddress ?? ""}
              label="Emergency contact address"
              name="emergencyContactAddress"
            />

            <Input
              defaultValue={user.emergencyContactRelationship ?? ""}
              label="Emergency contact relationship"
              name="emergencyContactRelationship"
            />

            <Input
              type="email"
              defaultValue={user.additionalEmail ?? ""}
              label="Additional email"
              name="additionalEmail"
            />

            <SubmitFormButton sticky />
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
                  <th align="right" className="w-3/12 p-2">
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
                        className="btn-error btn-xs btn w-full gap-2"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Remove
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="my-6 flex justify-end">
            {azureUserInfo === null && (
              <Link
                to="invite"
                relative="path"
                className="btn-primary btn w-64 gap-4"
              >
                <EnvelopeIcon className="h-6 w-6" />
                Invite
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
                    <span className="font-semibold">
                      {user.userAtChapter
                        .map(({ chapter }) => chapter.name)
                        .join(", ")}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <Link
              to="chapters/assign"
              relative="path"
              className="btn-primary btn w-64 gap-4"
            >
              <HomeModernIcon className="h-6 w-6" />
              Assign to a Chapter
            </Link>
          </div>

          <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />

          <div className="flex flex-wrap gap-4">
            <Link
              className="btn-outline btn w-60 gap-4"
              to="eoiProfile"
              relative="path"
            >
              <UserCircleIcon className="h-6 w-6" />
              EoI Profile
            </Link>
            <Link
              className="btn-outline btn w-60 gap-4"
              to="welcomeCall"
              relative="path"
            >
              <PhoneIcon className="h-6 w-6" />
              Welcome Call
            </Link>
            <Link
              className="btn-outline btn w-60 gap-4"
              to="references"
              relative="path"
            >
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
              References
            </Link>
            <Link
              className="btn-outline btn w-60 gap-4"
              to="induction"
              relative="path"
            >
              <NewspaperIcon className="h-6 w-6" />
              Induction
            </Link>
            <Link
              className="btn-outline btn w-60 gap-4"
              to="police-check"
              relative="path"
            >
              <ShieldCheckIcon className="h-6 w-6" />
              Police Check
            </Link>
            <Link
              className="btn-outline btn w-60 gap-4"
              to="wwc-check"
              relative="path"
            >
              <UserGroupIcon className="h-6 w-6" />
              WWC Check
            </Link>
            <Link
              className="btn-outline btn w-60 gap-4"
              to="approval-mrc"
              relative="path"
            >
              <CheckIcon className="h-6 w-6" />
              Approval by MRC
            </Link>
            <Link
              className="btn-outline btn w-60 gap-4"
              to="volunteer-agreement"
              relative="path"
            >
              <PencilIcon className="h-6 w-6" />
              Volunteer Agreement
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
