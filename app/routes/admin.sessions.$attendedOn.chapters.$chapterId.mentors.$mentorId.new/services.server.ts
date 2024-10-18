import { prisma } from "~/db.server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export interface SessionCommand {
  chapterId: number;
  mentorId: number;
  studentId: number;
  attendedOn: string;
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

export async function getMentorByIdAsync(id: number) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id,
      endDate: null,
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function getStudentsForMentorAsync(
  chapterId: number,
  mentorId: number,
) {
  const allStudents = await prisma.student.findMany({
    where: {
      chapterId,
      endDate: null,
      mentorToStudentAssignement: {
        none: {
          userId: mentorId,
        },
      },
    },
    select: {
      id: true,
      fullName: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  const assignedStudents = await prisma.mentorToStudentAssignement.findMany({
    where: {
      userId: mentorId,
      student: {
        endDate: null,
      },
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
  });

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
}: SessionCommand) {
  return await prisma.mentorToStudentSession.create({
    data: {
      chapterId,
      studentId,
      userId: mentorId,
      attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
    },
    select: {
      id: true,
    },
  });
}
