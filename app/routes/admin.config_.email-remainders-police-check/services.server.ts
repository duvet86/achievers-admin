import { prisma } from "~/db.server";

export async function getPoliceCheckRemainders(
  pageNumber: number,
  numberItems = 10,
) {
  return await prisma.policeCheck.findMany({
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
          firstName: true,
          lastName: true,
        },
      },
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}

export async function getWWCCheckRemainders() {
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
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export async function getPoliceCheckRemaindersCount() {
  return await prisma.policeCheck.count({
    where: {
      reminderSentAt: {
        not: null,
      },
    },
  });
}
