import type { AzureUserWebAppWithRole } from "~/services/azure.server";

import { prisma } from "~/db.server";

export async function getChaptersAsync() {
  return prisma.chapter.findMany();
}

export async function getChapterByIdAsync(id: AzureUserWebAppWithRole["id"]) {
  return prisma.chapter.findUniqueOrThrow({
    where: {
      id,
    },
  });
}
