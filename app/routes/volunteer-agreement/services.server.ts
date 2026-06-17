import { Gender } from "~/prisma/client";

import { prisma } from "~/db.server";

interface MentorCommand {
  firstName: string;
  lastName: string;
  preferredName: string | null;
  mobile: string;
  addressStreet: string;
  addressSuburb: string;
  addressState: string;
  addressPostcode: string;
  additionalEmail: string | null;
  dateOfBirth: Date | null;
  emergencyContactName: string | null;
  emergencyContactNumber: string | null;
  emergencyContactAddress: string | null;
  emergencyContactRelationship: string | null;
  hasApprovedToPublishPhotos: boolean | null;
  gender: Gender | null;
}

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.mentor.findUniqueOrThrow({
    where: {
      azureADId,
      endDate: null,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      mobile: true,
      addressStreet: true,
      addressSuburb: true,
      addressState: true,
      addressPostcode: true,
      dateOfBirth: true,
      emergencyContactName: true,
      emergencyContactNumber: true,
      emergencyContactAddress: true,
      emergencyContactRelationship: true,
      hasApprovedToPublishPhotos: true,
      volunteerAgreementSignedOn: true,
      additionalEmail: true,
      preferredName: true,
      gender: true,
    },
  });
}

export async function confirmUserDetailsAsync(
  mentorId: number,
  data: MentorCommand,
) {
  await prisma.mentor.update({
    where: {
      id: mentorId,
    },
    data: {
      ...data,
      volunteerAgreementSignedOn: new Date(),
    },
  });
}

export function parseGender(value: string | undefined | null): Gender | null {
  if (!value) {
    return null;
  }

  switch (value) {
    case "MALE":
      return Gender.MALE;
    case "FEMALE":
      return Gender.FEMALE;
    case "OTHER":
      return Gender.OTHER;
    case "PREFER_NOT_TO_SAY":
      return Gender.PREFER_NOT_TO_SAY;
    default:
      return Gender.PREFER_NOT_TO_SAY;
  }
}
