import type { User } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getMentorStudentsAsync(mentorId: User["id"]) {
  return prisma.mentorToStudentAssignement.findMany({
    where: {
      userId: mentorId,
    },
    select: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}
