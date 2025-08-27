import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { prisma } from "~/db.server";

dayjs.extend(relativeTime);

export async function getChapterByIdAsync(id: number) {
  return await prisma.chapter.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getSessionByIdAsync(sessionId: number) {
  return await prisma.session.findUniqueOrThrow({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      chapterId: true,
      attendedOn: true,
      completedOn: true,
      isCancelled: true,
      cancelledAt: true,
      cancelledBecauseOf: true,
      cancelledReason: true,
      report: true,
      notificationSentOn: true,
      studentSession: {
        select: {
          id: true,
          student: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
      mentorSession: {
        select: {
          id: true,
          mentor: {
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

export function getNotificationSentOnFromNow(notificationSentOn: Date | null) {
  if (!notificationSentOn) {
    return null;
  }

  return dayjs(notificationSentOn).fromNow();
}
