import { prisma } from "~/db.server";

export async function getPartnersAync(azureADId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      id: true,
    },
  });

  const studentAssignements = await prisma.mentorToStudentAssignement.findMany({
    where: {
      userId: user.id,
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

  return partners.filter(({ user: { id } }) => user.id !== id);
}
