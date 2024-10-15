import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { CheckSquareSolid, NavArrowLeft } from "iconoir-react";

import { getEnvironment } from "~/services";
import { getLoggedUserInfoAsync, version } from "~/services/.server";
import {
  Checkbox,
  DateInput,
  Input,
  Navbar,
  SubTitle,
  SubmitFormButton,
  Title,
} from "~/components";

import {
  confirmUserDetailsAsync,
  getUserByAzureADIdAsync,
} from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  return {
    environment: getEnvironment(request),
    userName: loggedUser.preferred_username,
    hasAgreed: user.volunteerAgreementSignedOn !== null,
    version,
    maxDateOfBirth: `${dayjs().year() - 18}-01-01`, // At least 18 years old.
    user,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const userId = formData.get("userId")?.toString();

  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const mobile = formData.get("mobile")?.toString();
  const addressStreet = formData.get("addressStreet")?.toString();
  const addressSuburb = formData.get("addressSuburb")?.toString();
  const addressState = formData.get("addressState")?.toString();
  const addressPostcode = formData.get("addressPostcode")?.toString();
  const dateOfBirth = formData.get("dateOfBirth")?.toString();
  const emergencyContactName = formData.get("emergencyContactName")?.toString();
  const emergencyContactNumber = formData
    .get("emergencyContactNumber")
    ?.toString();
  const emergencyContactAddress = formData
    .get("emergencyContactNumber")
    ?.toString();
  const emergencyContactRelationship = formData
    .get("emergencyContactNumber")
    ?.toString();
  const hasApprovedToPublishPhotos = formData
    .get("hasApprovedToPublishPhotos")
    ?.toString();

  if (
    userId === undefined ||
    firstName === undefined ||
    lastName === undefined ||
    mobile === undefined
  ) {
    throw new Error();
  }

  await confirmUserDetailsAsync(Number(userId), {
    firstName,
    lastName,
    mobile,
    addressStreet,
    addressSuburb,
    addressState,
    addressPostcode,
    dateOfBirth: new Date(dateOfBirth + "T00:00"),
    emergencyContactName,
    emergencyContactNumber,
    emergencyContactAddress,
    emergencyContactRelationship,
    hasApprovedToPublishPhotos: hasApprovedToPublishPhotos === "on",
    volunteerAgreementSignedOn: new Date(),
  });

  return redirect("/mentor/home");
}

export default function Index() {
  const { user, maxDateOfBirth, userName, environment, version, hasAgreed } =
    useLoaderData<typeof loader>();

  return (
    <div className="drawer-content flex flex-col">
      <Navbar userName={userName} environment={environment} version={version} />

      <main className="content-main mt-16 flex flex-col overflow-y-auto p-4">
        <div className="hero rounded-md bg-base-200">
          <div className="hero-content flex-col">
            <div className="text-center">
              <h1 className="text-4xl font-bold uppercase">
                Volunteer agreement
              </h1>
              <p className="py-6">
                The Achievers Club WA Inc. is an association incorporated
                pursuant to the Associations Incorporation Act 2015 (WA)
              </p>
            </div>

            <div className="card w-full bg-base-100 shadow-2xl">
              <Form method="post" className="card-body">
                {!hasAgreed && <Title>Confirm your details</Title>}

                {!hasAgreed && (
                  <fieldset>
                    <Input
                      label="First name"
                      name="firstName"
                      defaultValue={user.firstName}
                      required
                    />

                    <Input
                      label="Last name"
                      name="lastName"
                      defaultValue={user.lastName}
                      required
                    />

                    <Input
                      label="Mobile"
                      name="mobile"
                      defaultValue={user.mobile}
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

                    <SubTitle>Update your details</SubTitle>

                    <DateInput
                      label="Date of birth"
                      name="dateOfBirth"
                      defaultValue={user.dateOfBirth ?? ""}
                      max={maxDateOfBirth}
                      required
                    />

                    <Input
                      defaultValue={user.emergencyContactName ?? ""}
                      label="Emergency Contact Name"
                      name="emergencyContactName"
                      required
                    />

                    <Input
                      defaultValue={user.emergencyContactNumber ?? ""}
                      label="Emergency Contact Number"
                      name="emergencyContactNumber"
                      required
                    />

                    <Input
                      defaultValue={user.emergencyContactAddress ?? ""}
                      label="Emergency Contact Address"
                      name="emergencyContactAddress"
                      required
                    />

                    <Input
                      defaultValue={user.emergencyContactRelationship ?? ""}
                      label="Emergency Contact Relationship"
                      name="emergencyContactRelationship"
                      required
                    />

                    <p className="mt-6">
                      I authorise Achievers Club WA Inc. to publish photographs
                      of my image in any publications, electronic or otherwise
                      for the purposes of promoting the activities of the
                      Achievers Club:
                    </p>
                    <Checkbox
                      name="hasApprovedToPublishPhotos"
                      defaultChecked={user.hasApprovedToPublishPhotos ?? false}
                    />
                  </fieldset>
                )}

                <p className="mt-6">
                  I have been informed that copies of the Constitution of the
                  Achievers Club WA Inc. and its Child Protection Policy are on
                  the website:
                </p>
                <a className="link" href="www.achieversclubwa.org.au/policies">
                  www.achieversclubwa.org.au/policies
                </a>
                {hasAgreed ? (
                  <CheckSquareSolid />
                ) : (
                  <Checkbox name="isInformedOfConstitution" required />
                )}

                <p className="mt-6">
                  I will comply with all safety directions given to me by
                  officers of the Club in furtherance of its Child Protection
                  Policy and any COVID directions issued by the State
                  Government:
                </p>
                {hasAgreed ? (
                  <CheckSquareSolid />
                ) : (
                  <Checkbox name="hasApprovedSafetyDirections" required />
                )}

                <p className="mt-6">
                  I understand that the Club will take all due care to minimise
                  risk of loss or harm arising during mentoring activities, but
                  accepts no legal responsibility for any loss or harm that
                  occurs and I release the Club from same:
                </p>
                {hasAgreed ? (
                  <CheckSquareSolid />
                ) : (
                  <Checkbox name="hasAcceptedNoLegalResp" required />
                )}

                <p className="mt-6">
                  To the best of my knowledge all details I have provided on
                  this form are true and correct. I understand that submission
                  of this form does not guarantee me a volunteer role at the
                  Achievers Club WA:
                </p>
                {hasAgreed ? (
                  <CheckSquareSolid />
                ) : (
                  <Checkbox name="agree" required />
                )}

                <p className="mt-6">I am over 18 years of age:</p>
                {hasAgreed ? (
                  <CheckSquareSolid />
                ) : (
                  <Checkbox name="isOver18" required />
                )}

                <input type="hidden" name="userId" value={user.id} />

                <div className="flex justify-end">
                  {hasAgreed ? (
                    <Link
                      className="btn btn-neutral w-32 gap-2"
                      to="/mentor/home"
                    >
                      <NavArrowLeft />
                      Home
                    </Link>
                  ) : (
                    <SubmitFormButton />
                  )}
                </div>
              </Form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
