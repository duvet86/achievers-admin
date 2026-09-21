import dayjs from "dayjs";

import { prisma } from "~/db.server";
import { Prisma } from "~/prisma/client";

// Only the current check of each volunteer (the one that expires last) is
// relevant: older checks have been superseded by a renewal.
const currentCheckCondition = Prisma.sql`wcc.id = (
  SELECT w.id FROM WWCCheck w WHERE w.volunteerId = u.id ORDER BY w.expiryDate DESC, w.id DESC LIMIT 1
)`;

export async function getWWCCheckReminders(
  pageNumber: number,
  numberItems = 10,
) {
  const today = new Date();

  const checks = await prisma.$queryRaw<
    {
      id: number;
      reminderSentAt: Date | null;
      expiryDate: Date;
      volunteerId: number;
      fullName: string;
    }[]
  >`
    SELECT
      wcc.id,
      wcc.reminderSentAt,
      wcc.expiryDate,
      u.id volunteerId,
      u.fullName
    FROM WWCCheck wcc
    INNER JOIN Volunteer u ON u.id = wcc.volunteerId
    WHERE u.endDate IS NULL
      AND ${currentCheckCondition}
    ORDER BY wcc.expiryDate ASC
    LIMIT ${numberItems}
    OFFSET ${numberItems * pageNumber}`;

  return checks.map(
    ({ id, reminderSentAt, expiryDate, volunteerId, fullName }) => {
      const isExpiring = dayjs(today)
        .add(3, "months")
        .isAfter(dayjs(expiryDate));

      const hasExpired = dayjs(today).isAfter(dayjs(expiryDate));

      return {
        id,
        reminderSentAt,
        expiryDate,
        volunteer: {
          id: volunteerId,
          fullName,
        },
        isExpiring: isExpiring && !hasExpired,
        hasExpired,
      };
    },
  );
}

export async function getWWCRemindersCount() {
  const result = await prisma.$queryRaw<{ count: bigint | number }[]>`
    SELECT COUNT(*) count
    FROM WWCCheck wcc
    INNER JOIN Volunteer u ON u.id = wcc.volunteerId
    WHERE u.endDate IS NULL
      AND ${currentCheckCondition}`;

  return Number(result[0].count);
}
