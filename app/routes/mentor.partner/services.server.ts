import type { User } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getPartnersAync(userId: User["id"]) {
  const studentAssignements = await prisma.mentorToStudentAssignement.findMany({
    where: {
      userId,
    },
    select: {
      studentId: true,
    },
  });

  const partners = await prisma.mentorToStudentAssignement.findMany({
    distinct: "userId",
    where: {
      studentId: {
        in: studentAssignements.map(({ studentId }) => studentId),
      },
    },
    select: {
      user: {
        select: {
          id: true,
          fullName: true,
          mobile: true,
        },
      },
    },
  });

  return partners.filter(({ user: { id } }) => userId !== id);
}
