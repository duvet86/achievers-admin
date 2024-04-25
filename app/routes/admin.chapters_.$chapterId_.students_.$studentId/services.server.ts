import type { Chapter, Student, User } from "@prisma/client";

import { prisma } from "~/db.server";
import { getCurrentUserADIdAsync } from "~/services/.server";

export async function getMentorsInChapterAsync(
  chapterId: Chapter["id"],
  studentId: Student["id"],
) {
  return prisma.user.findMany({
    where: {
      chapterId,
      mentorToStudentAssignement: {
        none: {
          studentId,
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

export async function getStudentWithMentorsAsync(studentId: Student["id"]) {
  return prisma.student.findFirstOrThrow({
    where: {
      id: studentId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      mentorToStudentAssignement: {
        select: {
          user: {
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

export async function removeMentorStudentAssignement(
  userId: User["id"],
  studentId: Student["id"],
) {
  return await prisma.mentorToStudentAssignement.delete({
    where: {
      userId_studentId: {
        studentId,
        userId,
      },
    },
  });
}
