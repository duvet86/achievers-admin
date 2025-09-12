import { prisma } from "~/db.server";
import { UserRepository } from "~/infra/repositories/MentorRepository";

export async function getUserByIdAsync(id: number) {
  return await prisma.mentor.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      azureADId: true,
    },
  });
}

export async function updateAzureIdAsync(mentorId: number, azureId: string) {
  const userRepository = new UserRepository();
  const mentor = await userRepository.findByIdAsync(mentorId);

  mentor.updateAzureId(azureId);

  await userRepository.saveAsync(mentor);
}

export async function removeUserAccessAsync(mentorId: number) {
  const userRepository = new UserRepository();
  const mentor = await userRepository.findByIdAsync(mentorId);

  mentor.updateAzureId(null);

  await userRepository.saveAsync(mentor);
}
