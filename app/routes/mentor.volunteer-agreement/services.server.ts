import type { User } from "@prisma/client";

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
  return await prisma.user.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
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
    },
  });
}

export async function confirmUserDetailsAsync(
  userId: User["id"],
  data: UserData,
) {
  return await prisma.user.update({
    data,
    where: {
      id: userId,
    },
  });
}
