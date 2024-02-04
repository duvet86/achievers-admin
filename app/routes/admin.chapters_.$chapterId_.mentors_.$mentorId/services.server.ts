import type { Chapter, Student, User } from "@prisma/client";

import { prisma } from "~/db.server";
import { getCurrentUserADIdAsync } from "~/services";

export async function getStudentsInChapterAsync(
  chapterId: Chapter["id"],
  mentorId: User["id"],
) {
  return prisma.student.findMany({
    where: {
      studentAtChapter: {
        some: {
          chapterId,
        },
      },
      mentorToStudentAssignement: {
        none: {
          userId: mentorId,
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });
}

export async function getMentorWithStudentsAsync(mentorId: User["id"]) {
  return prisma.user.findFirstOrThrow({
    where: {
      id: mentorId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      frequencyInDays: true,
      mentorToStudentAssignement: {
        select: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
}

export async function assignStudentToMentorAsync(
  request: Request,
  mentorId: User["id"],
  studentId: Student["id"],
) {
  const currentUserAzureId = await getCurrentUserADIdAsync(request);

  return await prisma.mentorToStudentAssignement.create({
    data: {
      studentId,
      userId: mentorId,
      assignedBy: currentUserAzureId,
    },
  });
}
