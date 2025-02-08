import { prisma } from "~/db.server";

export async function getGoalById(id: number) {
  return await prisma.goal.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      goal: true,
      result: true,
      endDate: true,
      isAchieved: true,
      mentor: {
        select: {
          id: true,
          fullName: true,
        },
      },
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });
}
