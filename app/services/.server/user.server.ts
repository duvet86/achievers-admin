import { prisma } from "~/db.server";

import {
  deleteBlobAsync,
  getContainerClient,
  getSASQueryString,
  uploadBlobAsync,
  USER_DATA_BLOB_CONTAINER_NAME,
} from "./blob-storage.server";

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

export async function saveProfilePicture(
  userId: number,
  file: File,
): Promise<string> {
  if (file.size === 0) {
    throw new Error("File has 0 length.");
  }

  const containerClient = getContainerClient(USER_DATA_BLOB_CONTAINER_NAME);
  await containerClient.createIfNotExists();

  const path = `${userId}/profile-picture`;

  const resp = await uploadBlobAsync(containerClient, file, path);

  if (resp.errorCode !== undefined) {
    throw new Error(resp.errorCode);
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      profilePicturePath: path,
    },
  });

  return path;
}

export async function deleteProfilePicture(userId: number): Promise<void> {
  const containerClient = getContainerClient(USER_DATA_BLOB_CONTAINER_NAME);
  await containerClient.createIfNotExists();

  const path = `${userId}/profile-picture`;

  const resp = await deleteBlobAsync(containerClient, path);

  if (resp.errorCode !== undefined) {
    throw new Error(resp.errorCode);
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      profilePicturePath: null,
    },
  });
}
