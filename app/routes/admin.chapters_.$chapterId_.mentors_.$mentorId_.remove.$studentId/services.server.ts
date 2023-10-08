import type { Prisma } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getMentorAsync(
  userId_studentId: Prisma.MentorToStudentAssignementUserIdStudentIdCompoundUniqueInput,
) {
  return await prisma.mentorToStudentAssignement.findUniqueOrThrow({
    where: {
      userId_studentId,
    },
    select: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      student: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export async function removeMentorStudentAssignement(
  userId_studentId: Prisma.MentorToStudentAssignementUserIdStudentIdCompoundUniqueInput,
) {
  return await prisma.mentorToStudentAssignement.delete({
    where: {
      userId_studentId,
    },
  });
}
