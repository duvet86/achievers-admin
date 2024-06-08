import dayjs from "dayjs";
import { prisma } from "~/db.server";

export async function getPoliceCheckReminders(
  pageNumber: number,
  numberItems = 10,
) {
  const today = new Date();

  const policeChecks = await prisma.policeCheck.findMany({
    where: {
      user: {
        endDate: null,
      },
    },
    select: {
      id: true,
      reminderSentAt: true,
      expiryDate: true,
      user: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    skip: numberItems * pageNumber,
    take: numberItems,
    orderBy: {
      expiryDate: "asc",
    },
  });

  return policeChecks.map((pc) => {
    const isExpiring = dayjs(today)
      .add(3, "months")
      .isAfter(dayjs(pc.expiryDate));
    const hasExpired = dayjs(today).isAfter(dayjs(pc.expiryDate));

    return {
      ...pc,
      isExpiring: isExpiring && !hasExpired,
      hasExpired,
    };
  });
}

export async function getPoliceCheckRemindersCount() {
  return await prisma.policeCheck.count({
    where: {
      user: {
        endDate: null,
      },
    },
  });
}
