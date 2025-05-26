import type { $Enums } from "~/prisma/client";

import { prisma } from "~/db.server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export interface SessionCommand {
  chapterId: number;
  mentorId: number;
  studentId: number | null;
  attendedOn: string;
  status: string;
}

export async function getMentorSessionForDateAsync(
  chapterId: number,
  mentorId: number,
  attendedOn: string,
) {
  return await prisma.mentorSession.findUnique({
    where: {
      chapterId_mentorId_attendedOn: {
        chapterId,
        mentorId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
    },
    select: {
      id: true,
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

export async function getMentorByIdAsync(mentorId: number) {
  return await prisma.user.findFirstOrThrow({
    where: {
      id: mentorId,
    },
    select: {
      id: true,
      fullName: true,
    },
  });
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

export async function createSessionAsync({
  chapterId,
  mentorId,
  studentId,
  attendedOn,
  status,
}: SessionCommand) {
  const attendedOnConverted = dayjs.utc(attendedOn, "YYYY-MM-DD").toDate();

  if (studentId === null) {
    return await prisma.mentorSession.create({
      data: {
        chapterId,
        mentorId,
        attendedOn: attendedOnConverted,
        status: status as $Enums.SessionStatus,
      },
      select: {
        id: true,
      },
    });
  }

  const studenSession = await prisma.studentSession.findUnique({
    where: {
      chapterId_studentId_attendedOn: {
        chapterId,
        studentId,
        attendedOn: attendedOnConverted,
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (studenSession !== null) {
    if (studenSession.status !== "AVAILABLE") {
      throw new Error(`Student with id: ${studentId} is not available.`);
    }

    return await prisma.mentorSession.create({
      data: {
        chapterId,
        mentorId,
        attendedOn: attendedOnConverted,
        status: status as $Enums.SessionStatus,
        sessionAttendance: {
          create: {
            chapterId,
            attendedOn: attendedOnConverted,
            studentSessionId: studenSession.id,
          },
        },
      },
      select: {
        id: true,
      },
    });
  }

  return await prisma.$transaction(async (tx) => {
    const studenSession = await tx.studentSession.create({
      data: {
        chapterId,
        studentId,
        attendedOn: attendedOnConverted,
      },
    });

    return await tx.mentorSession.create({
      data: {
        chapterId,
        mentorId,
        attendedOn: attendedOnConverted,
        status: status as $Enums.SessionStatus,
        sessionAttendance: {
          create: {
            chapterId,
            attendedOn: attendedOnConverted,
            studentSessionId: studenSession.id,
          },
        },
      },
      select: {
        id: true,
      },
    });
  });
}
