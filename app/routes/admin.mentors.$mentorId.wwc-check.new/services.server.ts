import dayjs from "dayjs";

import { prisma } from "~/db.server";
import { getExtension } from "~/services";
import {
  getContainerClient,
  uploadBlobAsync,
  USER_DATA_BLOB_CONTAINER_NAME,
} from "~/services/.server";

export interface CreateWWCCheckCommand {
  wwcNumber: string;
  expiryDate: Date | string;
  filePath: string | undefined;
}

export async function getUserByIdAsync(id: number) {
  return await prisma.volunteer.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function createWWCCheckAsync(
  mentorId: number,
  data: CreateWWCCheckCommand,
) {
  return await prisma.wWCCheck.create({
    data: {
      expiryDate: dayjs(data.expiryDate).toDate(),
      filePath: data.filePath,
      wwcNumber: data.wwcNumber,
      volunteerId: mentorId,
    },
  });
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
  await containerClient.createIfNotExists();

  // Unique path per check so that uploading a new check doesn't overwrite the previous file.
  const path = `${userId}/wwc-check-${dayjs().format("YYYYMMDD")}.${getExtension(file.name)}`;

  await uploadBlobAsync(containerClient, file, path);

  return path;
}
