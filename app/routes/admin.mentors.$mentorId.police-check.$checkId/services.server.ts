import dayjs from "dayjs";

import { prisma } from "~/db.server";
import { getExtension } from "~/services";
import {
  getContainerClient,
  getSASQueryString,
  uploadBlobAsync,
  USER_DATA_BLOB_CONTAINER_NAME,
} from "~/services/.server";

export interface UpdatePoliceCheckCommand {
  applicationNumber: string | null;
  expiryDate: Date | string;
  // Undefined keeps the current file.
  filePath: string | undefined;
}

export async function getPoliceCheckByIdAsync(
  mentorId: number,
  checkId: number,
) {
  return await prisma.policeCheck.findFirstOrThrow({
    where: {
      id: checkId,
      volunteerId: mentorId,
    },
    select: {
      id: true,
      applicationNumber: true,
      expiryDate: true,
      filePath: true,
      volunteer: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });
}

export async function updatePoliceCheckAsync(
  mentorId: number,
  checkId: number,
  data: UpdatePoliceCheckCommand,
) {
  const expiryDate = dayjs(data.expiryDate);

  return await prisma.policeCheck.updateMany({
    where: {
      id: checkId,
      volunteerId: mentorId,
    },
    data: {
      applicationNumber: data.applicationNumber,
      expiryDate: expiryDate.toDate(),
      filePath: data.filePath,
      // A new expiry date that is far enough in the future makes the check eligible for a new reminder.
      reminderSentAt: expiryDate.isAfter(dayjs().subtract(3, "months"))
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
  await containerClient.createIfNotExists();

  // Unique path per upload so that replacing the file doesn't overwrite the previous one.
  const path = `${userId}/police-check-${dayjs().format("YYYYMMDD-HHmmss")}.${getExtension(file.name)}`;

  await uploadBlobAsync(containerClient, file, path);

  return path;
}
