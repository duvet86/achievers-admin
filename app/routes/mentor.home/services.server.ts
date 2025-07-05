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
      attendedOn: "desc",
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
