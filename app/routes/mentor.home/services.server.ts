import type { Term } from "~/models";

import dayjs from "dayjs";
import { prisma } from "~/db.server";

export async function getNextStudentSessionsAsync(
  mentorId: number,
  chapterId: number,
  term: Term,
) {
  const sessions = await prisma.studentSession.findMany({
    where: {
      session: {
        chapterId,
        mentorId,
        AND: [
          {
            attendedOn: {
              gt: new Date(),
            },
          },
          {
            attendedOn: {
              lte: term.end.toDate(),
            },
          },
        ],
      },
    },
    select: {
      id: true,
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
      session: {
        select: {
          attendedOn: true,
        },
      },
    },
    take: 3,
    orderBy: {
      session: {
        attendedOn: "asc",
      },
    },
  });

  return sessions.map(({ id, session, student }) => {
    const date = dayjs(session.attendedOn);
    const daysDiff = date.diff(new Date(), "days");
    const attendedOnlabel =
      daysDiff > 0
        ? `${date.format("MMMM D, YYYY")} (in ${daysDiff} days)`
        : `Tomorrow (${date.format("MMMM D, YYYY")})`;

    return {
      id,
      attendedOn: attendedOnlabel,
      studentFullName: student.fullName,
    };
  });
}

export async function getStudentSessionsAsync(
  mentorId: number,
  chapterId: number,
  term: Term,
) {
  return prisma.studentSession.findMany({
    where: {
      session: {
        chapterId,
        mentorId,
        AND: [
          {
            attendedOn: {
              lte: new Date(),
            },
          },
          {
            attendedOn: {
              gte: term.start.toDate(),
            },
          },
        ],
      },
    },
    select: {
      id: true,
      completedOn: true,
      signedOffOn: true,
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
      session: {
        select: {
          attendedOn: true,
        },
      },
    },
    orderBy: {
      session: {
        attendedOn: "desc",
      },
    },
    take: 5,
  });
}

export async function hasAnyStudentsAssignedAsync(mentorId: number) {
  return (
    (await prisma.mentorToStudentAssignement.count({
      where: {
        userId: mentorId,
      },
    })) > 0
  );
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
    },
  });
}
