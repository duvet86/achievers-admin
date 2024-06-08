import { prisma } from "~/db.server";

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
      firstName: true,
      lastName: true,
    },
  });
}

export async function getMentorForStudentAsync(studentId: number) {
  return await prisma.mentorToStudentAssignement.findMany({
    where: {
      studentId,
    },
    select: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
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
      attendedOn,
    },
    select: {
      id: true,
    },
  });
}
