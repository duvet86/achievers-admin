import { prisma } from "~/db.server";
import {
  getContainerClient,
  getSASQueryString,
  USER_DATA_BLOB_CONTAINER_NAME,
} from "~/services/.server";

export async function getUserByIdAsync(id: number) {
  return await prisma.volunteer.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
      wwcCheck: {
        // The first item is the current check (the one that expires last).
        orderBy: [{ expiryDate: "desc" }, { id: "desc" }],
      },
    },
  });
}

export async function deleteWWCCheckAsync(checkId: number) {
  return await prisma.wWCCheck.deleteMany({
    where: {
      id: checkId,
    },
  });
}

export function getFileUrl(path: string): string {
  const containerClient = getContainerClient(USER_DATA_BLOB_CONTAINER_NAME);

  const blob = containerClient.getBlobClient(path);

  const sasQueryString = getSASQueryString(containerClient, path, 60);

  return `${blob.url}?${sasQueryString}`;
}
