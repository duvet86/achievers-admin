import { prisma } from "~/db.server";
import {
  getContainerClient,
  getSASQueryStringAsync,
  uploadBlobAsync,
  USER_DATA_BLOB_CONTAINER_NAME,
} from "~/services";

export interface PoliceCheckUpdateCommand {
  filePath: string;
  expiryDate: Date | string;
}

export async function getUserByIdAsync(id: number) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      firstName: true,
      lastName: true,
      policeCheck: true,
    },
  });
}

export async function updatePoliceCheckAsync(
  userId: number,
  data: PoliceCheckUpdateCommand
) {
  return await prisma.policeCheck.upsert({
    where: {
      userId,
    },
    create: {
      expiryDate: data.expiryDate,
      filePath: data.filePath,
      userId,
    },
    update: {
      expiryDate: data.expiryDate,
      filePath: data.filePath,
    },
  });
}

export async function getFileUrlAsync(path: string): Promise<string> {
  const containerClient = getContainerClient(USER_DATA_BLOB_CONTAINER_NAME);

  const blob = containerClient.getBlobClient(path);

  const sasQueryString = await getSASQueryStringAsync(
    containerClient,
    path,
    60
  );

  return `${blob.url}?${sasQueryString}`;
}

export async function saveFileAsync(
  userId: string,
  file: File
): Promise<string> {
  if (file.size === 0) {
    throw new Error();
  }

  const containerClient = getContainerClient(USER_DATA_BLOB_CONTAINER_NAME);

  const path = `${userId}/police-check`;

  await uploadBlobAsync(containerClient, file, path);

  return path;
}
