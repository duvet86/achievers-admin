import type { Prisma, User } from "@prisma/client";

import { prisma } from "~/db.server";
import {
  getContainerClient,
  getSASQueryString,
  uploadBlobAsync,
  USER_DATA_BLOB_CONTAINER_NAME,
} from "~/services/.server";

export async function getChaptersAsync() {
  return await prisma.chapter.findMany({
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getUserByIdAsync(id: number) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      azureADId: true,
      fullName: true,
      firstName: true,
      lastName: true,
      email: true,
      mobile: true,
      addressStreet: true,
      addressSuburb: true,
      addressState: true,
      addressPostcode: true,
      dateOfBirth: true,
      emergencyContactName: true,
      emergencyContactNumber: true,
      emergencyContactAddress: true,
      emergencyContactRelationship: true,
      additionalEmail: true,
      profilePicturePath: true,
      volunteerAgreementSignedOn: true,
      hasApprovedToPublishPhotos: true,
      endDate: true,
      chapterId: true,
      chapter: {
        select: {
          id: true,
          name: true,
        },
      },
      approvalbyMRC: {
        select: {
          submittedDate: true,
        },
      },
      induction: {
        select: {
          completedOnDate: true,
        },
      },
      policeCheck: {
        select: {
          createdAt: true,
          expiryDate: true,
        },
      },
      references: {
        select: {
          calledOndate: true,
        },
      },
      welcomeCall: {
        select: {
          calledOnDate: true,
        },
      },
      wwcCheck: {
        select: {
          createdAt: true,
          expiryDate: true,
        },
      },
    },
  });
}

export async function updateUserByIdAsync(
  userId: User["id"],
  dataUpdate: Prisma.XOR<
    Prisma.UserUpdateInput,
    Prisma.UserUncheckedUpdateInput
  >,
) {
  return await prisma.user.update({
    data: dataUpdate,
    where: {
      id: userId,
    },
  });
}

export async function saveProfilePicture(
  userId: string,
  file: File,
): Promise<string> {
  if (file.size === 0) {
    throw new Error();
  }

  const containerClient = getContainerClient(USER_DATA_BLOB_CONTAINER_NAME);
  await containerClient.createIfNotExists();

  const path = `${userId}/profile-picture`;

  await uploadBlobAsync(containerClient, file, path);

  return path;
}

export function getProfilePictureUrl(profilePicturePath: string): string {
  const containerClient = getContainerClient(USER_DATA_BLOB_CONTAINER_NAME);

  const blob = containerClient.getBlobClient(profilePicturePath);

  const sasQueryString = getSASQueryString(
    containerClient,
    profilePicturePath,
    60,
  );

  return `${blob.url}?${sasQueryString}`;
}
