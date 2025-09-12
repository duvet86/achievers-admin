import { prisma } from "~/db.server";
import { UserRepository } from "~/infra/repositories/MentorRepository";

export async function getUserByIdAsync(id: number) {
  return await prisma.mentor.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function updateEndDateAsync(mentorId: number) {
  const userRepository = new UserRepository();
  const mentor = await userRepository.findByIdAsync(mentorId);

  mentor.unarchive();

  await userRepository.saveAsync(mentor);
}
