import dayjs from "dayjs";
import { prisma } from "~/db.server";

export async function getWWCCheckReminders(
  pageNumber: number,
  numberItems = 10,
) {
  const today = new Date();

  const checks = await prisma.wWCCheck.findMany({
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
  return await prisma.wWCCheck.count();
}
