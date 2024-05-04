import { prisma } from "~/db.server";

export async function getWWCCheckRemainders(
  pageNumber: number,
  numberItems = 10,
) {
  return await prisma.wWCCheck.findMany({
    where: {
      reminderSentAt: {
        not: null,
      },
    },
    select: {
      id: true,
      reminderSentAt: true,
      expiryDate: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}

export async function getWWCRemaindersCount() {
  return await prisma.wWCCheck.count({
    where: {
      reminderSentAt: {
        not: null,
      },
    },
  });
}
