import dayjs from "dayjs";

import { prisma } from "~/db.server";
import {
  getContainerClient,
  getSASQueryString,
  uploadBlobAsync,
  USER_DATA_BLOB_CONTAINER_NAME,
} from "~/services/.server";

export interface PoliceCheckUpdateCommand {
  expiryDate: Date | string;
  filePath: string | undefined;
}

export async function getUserByIdAsync(id: number) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
      policeCheck: true,
    },
  });
}

export async function updatePoliceCheckAsync(
  userId: number,
  data: PoliceCheckUpdateCommand,
) {
  const expiryDate = dayjs(data.expiryDate).toDate();

  return await prisma.policeCheck.upsert({
    where: {
      userId,
    },
    create: {
      expiryDate,
      filePath: data.filePath,
      userId,
    },
    update: {
      expiryDate,
      filePath: data.filePath,
      reminderSentAt: dayjs(data.expiryDate).isAfter(
        dayjs().subtract(3, "months"),
      )
        ? null
        : undefined,
    },
  });
}

export function getFileUrl(path: string): string {
  const containerClient = getContainerClient(USER_DATA_BLOB_CONTAINER_NAME);

  const blob = containerClient.getBlobClient(path);

  const sasQueryString = getSASQueryString(containerClient, path, 60);

  return `${blob.url}?${sasQueryString}`;
}

export async function saveFileAsync(
  userId: string,
  file: File,
): Promise<string> {
  if (file.size === 0) {
    throw new Error("File too small");
  }
  const allowedFormats = ["application/pdf", "image/png", "image/jpeg"];

  if (!allowedFormats.includes(file.type)) {
    throw new Error("Invalid extension.");
  }

  const containerClient = getContainerClient(USER_DATA_BLOB_CONTAINER_NAME);

  const path = `${userId}/police-check`;

  await uploadBlobAsync(containerClient, file, path);

  return path;
}
