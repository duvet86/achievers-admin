import { prisma } from "~/db.server";
import {
  inviteInternalAchieversUserAsync,
  inviteMentorAsync,
} from "~/services/.server";

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

export async function inviteInternalAchieversUserAndUpdateAsync(
  request: Request,
  email: string,
  mentorId: number,
) {
  const azureUser = await inviteInternalAchieversUserAsync(request, email);

  await updateAzureIdAsync(mentorId, azureUser.id);
}

export async function inviteMentorAndUpdateAsync(
  request: Request,
  email: string,
  mentorId: number,
) {
  const azureUserId = await inviteMentorAsync(request, email);

  await updateAzureIdAsync(mentorId, azureUserId);
}

async function updateAzureIdAsync(mentorId: number, azureADId: string) {
  await prisma.mentor.update({
    where: {
      id: mentorId,
    },
    data: {
      azureADId,
    },
  });
}
