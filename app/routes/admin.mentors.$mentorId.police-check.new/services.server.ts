import dayjs from "dayjs";

import { prisma } from "~/db.server";
import { getExtension } from "~/services";
import {
  getContainerClient,
  uploadBlobAsync,
  USER_DATA_BLOB_CONTAINER_NAME,
} from "~/services/.server";

export interface CreatePoliceCheckCommand {
  expiryDate: Date | string;
  applicationNumber: string | null;
  filePath: string | null;
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

export async function createPoliceCheckAsync(
  mentorId: number,
  data: CreatePoliceCheckCommand,
) {
  return await prisma.policeCheck.create({
    data: {
      expiryDate: dayjs(data.expiryDate).toDate(),
      applicationNumber: data.applicationNumber,
      filePath: data.filePath,
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
  const path = `${userId}/police-check-${dayjs().format("YYYYMMDD-HHmmss")}.${getExtension(file.name)}`;

  await uploadBlobAsync(containerClient, file, path);

  return path;
}
