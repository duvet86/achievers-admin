import { prisma } from "~/db.server";

export async function getPoliceCheckRemainders() {
  return await prisma.policeCheck.findMany({
    where: {
      reminderSentAt: {
        not: null
      }
    },
    select: {
      id: true,
      reminderSentAt: true,
      expiryDate: true,
      user: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });
}