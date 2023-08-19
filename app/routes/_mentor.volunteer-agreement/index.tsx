import type { LoaderArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { Checkbox, DateInput, Input, Title } from "~/components";

import { getUserByAzureADIdAsync, getCurrentUserADIdAsync } from "~/services";

export async function loader({ request }: LoaderArgs) {
  const azureUserId = await getCurrentUserADIdAsync(request);

  const user = await getUserByAzureADIdAsync(azureUserId);

  if (user.volunteerAgreementSignedOn !== null) {
    return redirect("/");
  }

  return json({
    user,
  });
}

export default function AppLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="hero rounded-md bg-base-200">
      <div className="hero-content flex-col">
        <div className="text-center">
          <h1 className="text-4xl font-bold uppercase">Volunteer agreement</h1>
          <p className="py-6">
            The Achievers Club WA Inc. is an association incorporated pursuant
            to the Associations Incorporation Act 2015 (WA)
          </p>
        </div>
        <div className="card w-full bg-base-100 shadow-2xl">
          <Form method="post" className="card-body">
            <Title>Confirm your details</Title>

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

            <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />

            <Title>Update your details</Title>

            <DateInput
              label="Date of birth"
              name="dateOfBirth"
              defaultValue={user.dateOfBirth ?? ""}
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
              I authorise Achievers Club WA Inc. to publish photographs of my
              image in any publications, electronic or otherwise for the
              purposes of promoting the activities of the Achievers Club:
            </p>
            <Checkbox name="hasApprovedToPublishPhotos" />

            <p className="mt-6">
              I have been informed that copies of the Constitution of the
              Achievers Club WA Inc. and its Child Protection Policy are on the
              website:
            </p>
            <a className="link" href="www.achieversclubwa.org.au/policies">
              www.achieversclubwa.org.au/policies
            </a>
            <Checkbox name="isInformedOfConstitution" required />

            <p className="mt-6">
              I will comply with all safety directions given to me by officers
              of the Club in furtherance of its Child Protection Policy and any
              COVID directions issued by the State Government:
            </p>
            <Checkbox name="hasApprovedSafetyDirections" required />

            <p className="mt-6">
              I understand that the Club will take all due care to minimise risk
              of loss or harm arising during mentoring activities, but accepts
              no legal responsibility for any loss or harm that occurs and I
              release the Club from same:
            </p>
            <Checkbox name="hasAcceptedNoLegalResp" required />

            <p className="mt-6">
              To the best of my knowledge all details I have provided on this
              form are true and correct. I understand that submission of this
              form does not guarantee me a volunteer role at the Achievers Club
              WA:
            </p>
            <Checkbox name="agree" required />

            <p className="mt-6">I am over 18 years of age:</p>
            <Checkbox name="isOver18" required />

            <div className="form-control mt-6">
              <button className="btn-primary btn">Submit</button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
