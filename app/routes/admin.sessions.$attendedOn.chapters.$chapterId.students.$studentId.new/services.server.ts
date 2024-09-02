import { prisma } from "~/db.server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export interface SessionCommand {
  chapterId: number;
  studentId: number;
  userId: number;
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

export async function getStudentByIdAsync(id: number) {
  return await prisma.student.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function getMentorForStudentAsync(
  chapterId: number,
  studentId: number,
) {
  const allMentors = await prisma.user.findMany({
    where: {
      chapterId,
      endDate: null,
      mentorToStudentAssignement: {
        none: {
          studentId,
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

  const assignedMentors = await prisma.mentorToStudentAssignement.findMany({
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
  });

  return assignedMentors
    .map(({ user: { id, fullName } }) => ({
      id,
      fullName: `** ${fullName} (Assigned) **`,
    }))
    .concat(allMentors);
}

export async function createSessionAsync({
  chapterId,
  studentId,
  userId,
  attendedOn,
}: SessionCommand) {
  return await prisma.mentorToStudentSession.create({
    data: {
      chapterId,
      studentId,
      userId,
      attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
    },
    select: {
      id: true,
    },
  });
}
