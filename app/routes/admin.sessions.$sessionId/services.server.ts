import { SessionRepository } from "@infrastructure/SessionRepository";
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
  return await prisma.sessionAttendance.findUniqueOrThrow({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      chapterId: true,
      attendedOn: true,
      completedOn: true,
      cancelledAt: true,
      cancelledReason: true,
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

export async function removeSessionAsync(sessionId: number) {
  // const session = await prisma.sessionAttendance.findUniqueOrThrow({
  //   where: {
  //     id: sessionId,
  //   },
  //   select: {
  //     id: true,
  //     completedOn: true,
  //   },
  // });

  const sessionRepo = new SessionRepository();

  const sessionEntity = await sessionRepo.findByIdAsync(sessionId);

  if (sessionEntity.isSessionFinalised()) {
    throw new Error(
      "Cannot remove session that has a report and it is completed.",
    );
  }

  await sessionRepo.deleteAsync(sessionId);

  // return await prisma.sessionAttendance.delete({
  //   where: {
  //     id: sessionId,
  //   },
  //   select: {
  //     id: true,
  //     chapterId: true,
  //     attendedOn: true,
  //     studentSession: {
  //       select: {
  //         studentId: true,
  //       },
  //     },
  //   },
  // });
}

export function getNotificationSentOnFromNow(notificationSentOn: Date | null) {
  if (!notificationSentOn) {
    return null;
  }

  return dayjs(notificationSentOn).fromNow();
}
