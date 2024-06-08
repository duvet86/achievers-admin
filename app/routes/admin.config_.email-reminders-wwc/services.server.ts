import dayjs from "dayjs";
import { prisma } from "~/db.server";

export async function getWWCCheckReminders(
  pageNumber: number,
  numberItems = 10,
) {
  const today = new Date();

  const checks = await prisma.wWCCheck.findMany({
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

  return checks.map((wc) => {
    const isExpiring = dayjs(today)
      .add(3, "months")
      .isAfter(dayjs(wc.expiryDate));
    const hasExpired = dayjs(today).isAfter(dayjs(wc.expiryDate));

    return {
      ...wc,
      isExpiring: isExpiring && !hasExpired,
      hasExpired,
    };
  });
}

export async function getWWCRemindersCount() {
  return await prisma.wWCCheck.count({
    where: {
      user: {
        endDate: null,
      },
    },
  });
}
