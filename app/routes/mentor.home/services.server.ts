import type { Term } from "~/models";

import dayjs from "dayjs";

import { prisma } from "~/db.server";

export async function getNextMentorSessionsAsync(
  mentorId: number,
  chapterId: number,
  term: Term,
) {
  const mentorSessions = await prisma.mentorSession.findMany({
    where: {
      chapterId,
      mentorId,
      attendedOn: {
        gt: new Date(),
        lte: term.end.toDate(),
      },
    },
    select: {
      id: true,
      attendedOn: true,
      session: {
        select: {
          id: true,
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
    take: 3,
    orderBy: {
      attendedOn: "asc",
    },
  });

  return mentorSessions.flatMap(({ attendedOn, session }) => {
    const date = dayjs(attendedOn);
    const daysDiff = date.diff(new Date(), "days");
    const attendedOnlabel =
      daysDiff > 0
        ? `${date.format("MMMM D, YYYY")} (in ${daysDiff} days)`
        : `Tomorrow (${date.format("MMMM D, YYYY")})`;

    return session.map((session) => ({
      id: session.id,
      attendedOn: attendedOnlabel,
      studentFullName: session.studentSession.student.fullName,
    }));
  });
}

export async function getSessionsAsync(
  mentorId: number,
  chapterId: number,
  term: Term,
) {
  return await prisma.$queryRaw<
    {
      sessionId: number;
      attendedOn: string;
      completedOn: string | null;
      signedOffOn: string | null;
      studentId: number;
      studentFullName: string;
    }[]
  >`
    SELECT
      sa.id AS sessionId,
      sa.attendedOn,
      sa.completedOn,
      sa.signedOffOn,
      s.id AS studentId,
      s.fullName AS studentFullName
    FROM Session sa
    INNER JOIN StudentSession ss ON ss.id = sa.studentSessionId
    INNER JOIN Student s ON s.id = ss.studentId
    INNER JOIN MentorSession ms ON ms.id = sa.mentorSessionId
    WHERE sa.chapterId = ${chapterId}
      AND ms.mentorId = ${mentorId}
      AND sa.attendedOn BETWEEN ${term.start.format("YYYY-MM-DD")} AND ${dayjs().format("YYYY-MM-DD")}
    ORDER BY sa.attendedOn DESC
    LIMIT 5;`;
}

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.user.findUniqueOrThrow({
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
