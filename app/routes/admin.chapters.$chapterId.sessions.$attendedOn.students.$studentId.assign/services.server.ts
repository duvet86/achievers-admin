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

export async function getSessionsByDateAsync(
  chapterId: number,
  attendedOn: string,
) {
  return await prisma.mentorToStudentSession.findMany({
    where: {
      chapterId,
      attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
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

export async function getStudentByIdAsync(studentId: number) {
  return await prisma.student.findFirstOrThrow({
    where: {
      id: studentId,
    },
    select: {
      id: true,
      fullName: true,
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
