import { prisma } from "~/db.server";

export async function getUserByIdAsync(id: number) {
  return await prisma.mentor.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
      endDate: true,
      endReason: true,
    },
  });
}
