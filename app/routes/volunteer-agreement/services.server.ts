import { prisma } from "~/db.server";

export interface UserData {
  firstName: string;
  lastName: string;
  mobile: string;
  addressStreet: string | undefined;
  addressSuburb: string | undefined;
  addressState: string | undefined;
  addressPostcode: string | undefined;
  dateOfBirth: Date | undefined;
  emergencyContactName: string | undefined;
  emergencyContactNumber: string | undefined;
  emergencyContactAddress: string | undefined;
  emergencyContactRelationship: string | undefined;
  hasApprovedToPublishPhotos: boolean | undefined;
  volunteerAgreementSignedOn: Date | undefined;
}

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.mentor.findUniqueOrThrow({
    where: {
      azureADId,
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
    },
  });
}

export async function confirmUserDetailsAsync(
  mentorId: number,
  data: UserData,
) {
  return await prisma.mentor.update({
    data,
    where: {
      id: mentorId,
    },
  });
}
