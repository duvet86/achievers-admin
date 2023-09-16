import dayjs from "dayjs";

import { prisma } from "~/db.server";
import {
  getContainerClient,
  getSASQueryStringAsync,
  uploadBlobAsync,
  USER_DATA_BLOB_CONTAINER_NAME,
} from "~/services";

export interface UpdateWWCCheckCommand {
  wwcNumber: string;
  expiryDate: Date | string;
  filePath: string | undefined;
}

export async function getUserByIdAsync(id: number) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      firstName: true,
      lastName: true,
      wwcCheck: true,
    },
  });
}

export async function updateWWCCheckAsync(
  userId: number,
  data: UpdateWWCCheckCommand,
) {
  const expiryDate = dayjs(data.expiryDate).toDate();

  return await prisma.wWCCheck.upsert({
    where: {
      userId,
    },
    create: {
      expiryDate,
      filePath: data.filePath,
      wwcNumber: data.wwcNumber,
      userId,
    },
    update: {
      expiryDate,
      filePath: data.filePath,
      wwcNumber: data.wwcNumber,
    },
  });
}

export async function getFileUrl(path: string): Promise<string> {
  const containerClient = getContainerClient(USER_DATA_BLOB_CONTAINER_NAME);

  const blob = containerClient.getBlobClient(path);

  const sasQueryString = await getSASQueryStringAsync(
    containerClient,
    path,
    60,
  );

  return `${blob.url}?${sasQueryString}`;
}

export async function saveFileAsync(
  userId: string,
  file: File,
): Promise<string> {
  if (file.size === 0) {
    throw new Error();
  }

  const containerClient = getContainerClient(USER_DATA_BLOB_CONTAINER_NAME);

  const path = `${userId}/wwc-check`;

  await uploadBlobAsync(containerClient, file, path);

  return path;
}
