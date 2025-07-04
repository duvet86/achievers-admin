import { prisma } from "~/db.server";

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.mentor.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      volunteerAgreementSignedOn: true,
    },
  });
}
