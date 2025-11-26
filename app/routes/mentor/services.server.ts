import { prisma } from "~/db.server";

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.mentor.findUnique({
    where: {
      azureADId,
      endDate: null,
    },
    select: {
      volunteerAgreementSignedOn: true,
      profilePicturePath: true,
    },
  });
}
