import { prisma } from "~/db.server";

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      volunteerAgreement: true,
    },
  });
}
