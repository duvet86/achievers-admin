import { prisma } from "~/db.server";
import { UserRepository } from "~/infra/repositories/MentorRepository";
import { getCurrentHost } from "~/services";
import {
  APP_ID,
  assignRoleToUserAsync,
  getAzureUserByAzureEmailAsync,
  inviteUserToAzureAsync,
  MENTOR_ROLE_APP_ID,
  searchAzureUserByEmailAsync,
  trackEvent,
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

export async function inviteInternalAchieversUserAsync(
  request: Request,
  email: string,
  mentorId: number,
) {
  const azureUser = await getAzureUserByAzureEmailAsync(request, email);

  if (
    azureUser.appRoleAssignments.filter(
      (p) => p.appRoleId === MENTOR_ROLE_APP_ID,
    ).length === 0
  ) {
    const assignRoleResponse = await assignRoleToUserAsync(
      request,
      azureUser.id,
      {
        principalId: azureUser.id,
        appRoleId: MENTOR_ROLE_APP_ID,
        resourceId: APP_ID,
      },
    );

    trackEvent("ASSIGN_ROLE_TO_MENTOR", {
      id: assignRoleResponse.id,
    });
  }

  await updateAzureIdAsync(mentorId, azureUser.id);
}

export async function inviteUserAsync(
  request: Request,
  email: string,
  mentorId: number,
) {
  const azureUser = await searchAzureUserByEmailAsync(request, email);

  let azureuserId: string;

  if (azureUser === null) {
    const inviteUserToAzureResponse = await inviteUserToAzureAsync(request, {
      invitedUserEmailAddress: email,
      inviteRedirectUrl: getCurrentHost(request),
      sendInvitationMessage: true,
    });

    trackEvent("GIVE_ACCESS_MENTOR", {
      id: inviteUserToAzureResponse.id,
    });

    azureuserId = inviteUserToAzureResponse.invitedUser.id;
  } else {
    azureuserId = azureUser.id;
  }

  if (
    azureUser === null ||
    azureUser.appRoleAssignments.filter(
      (p) => p.appRoleId === MENTOR_ROLE_APP_ID,
    ).length === 0
  ) {
    const assignRoleResponse = await assignRoleToUserAsync(
      request,
      azureuserId,
      {
        principalId: azureuserId,
        appRoleId: MENTOR_ROLE_APP_ID,
        resourceId: APP_ID,
      },
    );

    trackEvent("ASSIGN_ROLE_TO_MENTOR", {
      id: assignRoleResponse.id,
    });
  }

  await updateAzureIdAsync(mentorId, azureuserId);
}

async function updateAzureIdAsync(mentorId: number, azureId: string) {
  const userRepository = new UserRepository();
  const mentor = await userRepository.findByIdAsync(mentorId);

  mentor.updateAzureId(azureId);

  await userRepository.saveAsync(mentor);
}
