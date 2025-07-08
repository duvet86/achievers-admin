import type { Term } from "~/models";

import dayjs from "dayjs";

import { prisma } from "~/db.server";

export async function getSessionsCountAsync(
  mentorId: number,
  chapterId: number,
  term: Term,
) {
  return await prisma.mentorSession.count({
    where: {
      chapterId,
      mentorId,
      attendedOn: {
        gte: term.start.toDate(),
        lte: term.end.toDate(),
      },
    },
  });
}

export async function getSessionsAsync(
  pageNumber: number,
  mentorId: number,
  chapterId: number,
  term: Term,
  numberItems = 10,
) {
  const mentorSessions = await prisma.mentorSession.findMany({
    where: {
      chapterId,
      mentorId,
      attendedOn: {
        gte: term.start.toDate(),
        lte: term.end.toDate(),
      },
    },
    select: {
      id: true,
      attendedOn: true,
      session: {
        select: {
          id: true,
          completedOn: true,
          signedOffOn: true,
          isCancelled: true,
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
        },
      },
    },
    orderBy: {
      attendedOn: "asc",
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });

  return mentorSessions.flatMap(({ attendedOn, session }) => {
    const date = dayjs(attendedOn);
    const daysDiff = date.diff(new Date(), "days");

    return session.map((session) => ({
      ...session,
      attendedOn,
      daysDiff,
    }));
  });
}

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.mentor.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      id: true,
      fullName: true,
      chapterId: true,
      profilePicturePath: true,
    },
  });
}

export async function sessionsStatsAsync(userId: number) {
  const sessionStats = await prisma.$queryRaw<
    {
      sessionCount: number;
      reportCount: number;
      minAttendedOn: string;
    }[]
  >`
    SELECT 
      COUNT(*) sessionCount,
      COUNT(s.report) reportCount,
      MIN(s.attendedOn) minAttendedOn
    FROM MentorSession ms
    INNER JOIN Session s ON s.mentorSessionId = ms.id
    WHERE ms.mentorId = ${userId} AND ms.status = 'AVAILABLE' AND s.attendedOn <= ${dayjs().format("YYYY-MM-DD")}`;

  return sessionStats?.[0] ?? null;
}

export async function studentsMentoredAsync(userId: number) {
  const studentsMentored = await prisma.$queryRaw<{ studentId: number }[]>`
    SELECT
      ss.studentId
    FROM MentorSession ms
    INNER JOIN Session s ON s.mentorSessionId = ms.id
    INNER JOIN StudentSession ss ON ss.id = s.studentSessionId
    WHERE ms.mentorId = ${userId}
    GROUP BY ss.studentId`;

  return studentsMentored.length;
}
