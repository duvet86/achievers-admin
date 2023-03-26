import { prisma } from "~/db.server";
import {
  getContainerClient,
  getSASQueryStringAsync,
  USER_DATA_BLOB_CONTAINER_NAME,
} from "~/services";

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

export async function getFileUrl(path: string): Promise<string> {
  const containerClient = getContainerClient(USER_DATA_BLOB_CONTAINER_NAME);

  const blob = containerClient.getBlobClient(path);

  const sasQueryString = await getSASQueryStringAsync(
    containerClient,
    path,
    60
  );

  return `${blob.url}?${sasQueryString}`;
}
