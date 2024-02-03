import { prisma } from "~/db.server";

export async function getUserByAzureADIdAsync(
  azureADId: string,
  includeChapter = false,
) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      azureADId,
    },
    include: {
      userAtChapter: includeChapter,
    },
  });
}
