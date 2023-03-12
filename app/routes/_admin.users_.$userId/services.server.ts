import type { Prisma, User, UserAtChapter } from "@prisma/client";

import { prisma } from "~/db.server";
import {
  getContainerClient,
  getExtension,
  getSASUrlAsync,
  uploadBlobAsync,
  USER_DATA_BLOB_CONTAINER_NAME,
} from "~/services";

export async function getUserByIdAsync(id: string) {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
}

export async function updateUserByIdAsync(
  userId: User["id"],
  dataCreate: Prisma.XOR<
    Prisma.UserCreateInput,
    Prisma.UserUncheckedCreateInput
  >,
  dataUpdate: Prisma.XOR<
    Prisma.UserUpdateInput,
    Prisma.UserUncheckedUpdateInput
  >
) {
  return await prisma.user.upsert({
    create: dataCreate,
    update: dataUpdate,
    where: {
      id: userId,
    },
  });
}

export async function getUserAtChaptersByIdAsync(
  userId: UserAtChapter["userId"]
) {
  return await prisma.userAtChapter.findMany({
    where: {
      userId,
    },
    select: {
      Chapter: true,
    },
  });
}

export async function saveProfilePicture(
  userId: string,
  profilePictureFile: File | null
): Promise<string | null> {
  if (!profilePictureFile || profilePictureFile.size === 0) {
    return null;
  }

  const containerClient = getContainerClient(USER_DATA_BLOB_CONTAINER_NAME);

  if (profilePictureFile && profilePictureFile.size > 0) {
    const profilePicturePath = `${userId}/profile-picture.${getExtension(
      profilePictureFile.name
    )}`;

    await uploadBlobAsync(
      containerClient,
      profilePictureFile,
      profilePicturePath
    );

    return profilePicturePath;
  }

  return null;
}

export async function getProfilePictureUrl(
  profilePicturePath?: string
): Promise<string | null> {
  if (!profilePicturePath) {
    return null;
  }

  const containerClient = getContainerClient(USER_DATA_BLOB_CONTAINER_NAME);

  return await getSASUrlAsync(containerClient, profilePicturePath, 60);
}
