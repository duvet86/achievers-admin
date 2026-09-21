import dayjs from "dayjs";

import { prisma } from "~/db.server";
import { Prisma } from "~/prisma/client";

// Only the current check of each volunteer (the one that expires last) is
// relevant: older checks have been superseded by a renewal.
const currentCheckCondition = Prisma.sql`pc.id = (
  SELECT p2.id FROM PoliceCheck p2 WHERE p2.volunteerId = u.id ORDER BY p2.expiryDate DESC, p2.id DESC LIMIT 1
)`;

export async function getPoliceCheckReminders(
  pageNumber: number,
  numberItems = 10,
) {
  const today = new Date();

  const policeChecks = await prisma.$queryRaw<
    {
      id: number;
      reminderSentAt: Date | null;
      expiryDate: Date;
      volunteerId: number;
      fullName: string;
    }[]
  >`
    SELECT
      pc.id,
      pc.reminderSentAt,
      pc.expiryDate,
      u.id volunteerId,
      u.fullName
    FROM PoliceCheck pc
    INNER JOIN Volunteer u ON u.id = pc.volunteerId
    WHERE u.endDate IS NULL
      AND ${currentCheckCondition}
    ORDER BY pc.expiryDate ASC
    LIMIT ${numberItems}
    OFFSET ${numberItems * pageNumber}`;

  return policeChecks.map(
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

export async function getPoliceCheckRemindersCount() {
  const result = await prisma.$queryRaw<{ count: bigint | number }[]>`
    SELECT COUNT(*) count
    FROM PoliceCheck pc
    INNER JOIN Volunteer u ON u.id = pc.volunteerId
    WHERE u.endDate IS NULL
      AND ${currentCheckCondition}`;

  return Number(result[0].count);
}
