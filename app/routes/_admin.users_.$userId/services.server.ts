import type { Prisma, User, UserAtChapter } from "@prisma/client";

import { prisma } from "~/db.server";
import {
  getContainerClient,
  getSASQueryStringAsync,
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
  file: File
): Promise<string | null> {
  if (file.size === 0) {
    throw new Error();
  }

  const containerClient = getContainerClient(USER_DATA_BLOB_CONTAINER_NAME);

  const path = `${userId}/profile-picture`;

  await uploadBlobAsync(containerClient, file, path);

  return path;
}

export async function savePoliceCheck(
  userId: string,
  file: File
): Promise<string | null> {
  if (file.size === 0) {
    throw new Error();
  }

  const containerClient = getContainerClient(USER_DATA_BLOB_CONTAINER_NAME);

  const path = `${userId}/police-check`;

  await uploadBlobAsync(containerClient, file, path);

  return path;
}

export async function saveWWCCheck(
  userId: string,
  file: File
): Promise<string | null> {
  if (file.size === 0) {
    throw new Error();
  }

  const containerClient = getContainerClient(USER_DATA_BLOB_CONTAINER_NAME);

  const path = `${userId}/wwc-check`;

  await uploadBlobAsync(containerClient, file, path);

  return path;
}

export async function getProfilePictureUrl(
  profilePicturePath: string
): Promise<string> {
  const containerClient = getContainerClient(USER_DATA_BLOB_CONTAINER_NAME);

  const blob = containerClient.getBlobClient(profilePicturePath);

  const sasQueryString = await getSASQueryStringAsync(
    containerClient,
    profilePicturePath,
    60
  );

  return `${blob.url}?${sasQueryString}`;
}
