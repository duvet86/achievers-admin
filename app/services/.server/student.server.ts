import { prisma } from "~/db.server";

import {
  deleteBlobAsync,
  getContainerClient,
  getSASQueryString,
  STUDENT_DATA_BLOB_CONTAINER_NAME,
  uploadBlobAsync,
} from "./blob-storage.server";

export function getStudentProfilePictureUrl(
  profilePicturePath: string,
): string {
  const containerClient = getContainerClient(STUDENT_DATA_BLOB_CONTAINER_NAME);

  const blob = containerClient.getBlobClient(profilePicturePath);

  const sasQueryString = getSASQueryString(
    containerClient,
    profilePicturePath,
    60,
  );

  return `${blob.url}?${sasQueryString}`;
}

export async function saveStudentProfilePicture(
  studentId: number,
  file: File,
): Promise<string> {
  if (file.size === 0) {
    throw new Error("File has 0 length.");
  }

  const containerClient = getContainerClient(STUDENT_DATA_BLOB_CONTAINER_NAME);
  await containerClient.createIfNotExists();

  const path = `${studentId}/profile-picture`;

  const resp = await uploadBlobAsync(containerClient, file, path);

  if (resp.errorCode !== undefined) {
    throw new Error(resp.errorCode);
  }

  await prisma.student.update({
    where: {
      id: studentId,
    },
    data: {
      profilePicturePath: path,
    },
  });

  return path;
}

export async function deleteStudentProfilePicture(
  studentId: number,
): Promise<void> {
  const containerClient = getContainerClient(STUDENT_DATA_BLOB_CONTAINER_NAME);
  await containerClient.createIfNotExists();

  const path = `${studentId}/profile-picture`;

  const resp = await deleteBlobAsync(containerClient, path);

  if (resp.errorCode !== undefined) {
    throw new Error(resp.errorCode);
  }

  await prisma.student.update({
    where: {
      id: studentId,
    },
    data: {
      profilePicturePath: null,
    },
  });
}
