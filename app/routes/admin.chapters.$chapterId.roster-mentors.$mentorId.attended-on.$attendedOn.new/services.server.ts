import type { $Enums } from "@prisma/client";

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

export async function getSessionForDateAsync(
  chapterId: number,
  mentorId: number,
  attendedOn: string,
) {
  return await prisma.session.findUnique({
    where: {
      mentorId_chapterId_attendedOn: {
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
  if (studentId === null) {
    return await prisma.session.create({
      data: {
        chapterId,
        mentorId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
        status: status as $Enums.SessionStatus,
      },
      select: {
        id: true,
      },
    });
  }

  return await prisma.session.create({
    data: {
      chapterId,
      mentorId,
      attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      studentSession: {
        create: {
          studentId,
        },
      },
    },
    select: {
      id: true,
    },
  });
}
