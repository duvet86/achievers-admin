import { prisma } from "~/db.server";
import {
  deleteAzureUserAsync,
  inviteInternalAchieversUserAsync,
  inviteMentorAsync,
} from "~/services/.server";

export async function isUniqueEmailAsync(email: string) {
  const count = await prisma.mentor.count({
    where: {
      email,
    },
  });

  return count === 0;
}

export async function udpdateInvitedMentorEmailAsync(
  request: Request,
  id: number,
  email: string,
) {
  const mentor = await prisma.mentor.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      azureADId: true,
    },
  });

  if (mentor.azureADId === null) {
    throw new Error("Mentor is not part of Azure AD.");
  }

  await deleteAzureUserAsync(request, mentor.azureADId);

  await prisma.mentor.update({
    where: {
      id,
    },
    data: {
      email,
    },
  });

  let azureUserId: string;
  if (email.includes("achieversclubwa.org.au")) {
    const azureUser = await inviteInternalAchieversUserAsync(request, email);
    azureUserId = azureUser.id;
  } else {
    azureUserId = await inviteMentorAsync(request, email);
  }

  await prisma.mentor.update({
    where: {
      id,
    },
    data: {
      azureADId: azureUserId,
    },
  });
}
