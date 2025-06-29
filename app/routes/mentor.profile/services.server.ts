import { prisma } from "~/db.server";

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      id: true,
      fullName: true,
      profilePicturePath: true,
      firstName: true,
      lastName: true,
      preferredName: true,
      email: true,
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
      additionalEmail: true,
      volunteerAgreementSignedOn: true,
      hasApprovedToPublishPhotos: true,
      chapter: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}
