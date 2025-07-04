import { prisma } from "~/db.server";

export async function getImportHistoryAsync(
  pageNumber: number,
  numberItems = 10,
) {
  return await prisma.importedHistory.findMany({
    select: {
      error: true,
      createdAt: true,
      mentor: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}

export async function getImportHistoryCountAsync() {
  return await prisma.importedHistory.count();
}
