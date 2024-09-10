import { prisma } from "~/db.server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export interface SessionCommand {
  sessionId: number;
  mentorId: number;
  studentId: number;
}

export async function getSessionsByDateAsync(
  chapterId: number,
  attendedOn: Date,
) {
  return await prisma.mentorToStudentSession.findMany({
    where: {
      chapterId,
      attendedOn,
    },
    select: {
      userId: true,
      studentId: true,
    },
  });
}

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
  return await prisma.mentorToStudentSession.findFirstOrThrow({
    where: {
      id: sessionId,
    },
    select: {
      attendedOn: true,
      user: {
        select: {
          id: true,
          fullName: true,
        },
      },
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });
}

export async function getMentorsForStudentAsync(
  chapterId: number,
  studentId: number | null,
) {
  const allMentors = await prisma.user.findMany({
    where: {
      chapterId,
      endDate: null,
      mentorToStudentAssignement: studentId
        ? {
            none: {
              studentId,
            },
          }
        : undefined,
    },
    select: {
      id: true,
      fullName: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  const assignedMentors = studentId
    ? await prisma.mentorToStudentAssignement.findMany({
        where: {
          studentId,
        },
        select: {
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          user: {
            fullName: "asc",
          },
        },
      })
    : [];

  return assignedMentors
    .map(({ user: { id, fullName } }) => ({
      id,
      fullName: `** ${fullName} (Assigned) **`,
    }))
    .concat(allMentors);
}

export async function getStudentsForMentorAsync(
  chapterId: number,
  mentorId: number | null,
) {
  const allStudents = await prisma.student.findMany({
    where: {
      chapterId,
      endDate: null,
      mentorToStudentAssignement: mentorId
        ? {
            none: {
              userId: mentorId,
            },
          }
        : undefined,
    },
    select: {
      id: true,
      fullName: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  const assignedStudents = mentorId
    ? await prisma.mentorToStudentAssignement.findMany({
        where: {
          userId: mentorId,
        },
        select: {
          student: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          user: {
            fullName: "asc",
          },
        },
      })
    : [];

  return assignedStudents
    .map(({ student: { id, fullName } }) => ({
      id,
      fullName: `** ${fullName} (Assigned) **`,
    }))
    .concat(allStudents);
}

export async function updateSessionAsync({
  sessionId,
  mentorId,
  studentId,
}: SessionCommand) {
  return await prisma.mentorToStudentSession.update({
    where: {
      id: sessionId,
    },
    data: {
      studentId,
      userId: mentorId,
    },
    select: {
      id: true,
    },
  });
}
