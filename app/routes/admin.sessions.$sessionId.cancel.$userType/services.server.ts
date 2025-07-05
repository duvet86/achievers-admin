import type { $Enums } from "~/prisma/client";

import { prisma } from "~/db.server";

export async function getCancelReasons() {
  return await prisma.sessionCancelledReason.findMany({
    select: {
      id: true,
      reason: true,
    },
  });
}

export async function getSession(sessionId: number) {
  return await prisma.session.findUniqueOrThrow({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      attendedOn: true,
      completedOn: true,
      isCancelled: true,
      cancelledReasonId: true,
      cancelledExtendedReason: true,
      mentorSession: {
        select: {
          mentor: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
      studentSession: {
        select: {
          student: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
  });
}

export async function cancelSession(
  sessionId: number,
  entityType: $Enums.CancelledEntity,
  cancelledReasonId: number,
  cancelledExtendedReason: string,
) {
  return await prisma.session.update({
    where: {
      id: sessionId,
    },
    data: {
      cancelledAt: new Date(),
      cancelledBecauseOf: entityType,
      cancelledReasonId,
      cancelledExtendedReason,
    },
  });
}
