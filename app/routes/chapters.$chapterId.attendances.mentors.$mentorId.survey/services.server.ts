import { prisma } from "~/db.server";

export async function getMentorByIdAsync(mentorId: number) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id: mentorId,
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}
