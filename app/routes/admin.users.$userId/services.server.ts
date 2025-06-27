import type { FileUpload } from "@mjackson/form-data-parser";
import type { Prisma } from "~/prisma/client";
import type { XOR } from "~/models";

import { MemoryFileStorage } from "@mjackson/file-storage/memory";

import { prisma } from "~/db.server";
import {
  deleteBlobAsync,
  getContainerClient,
  getSASQueryString,
  uploadBlobAsync,
  USER_DATA_BLOB_CONTAINER_NAME,
} from "~/services/.server";

const memoryFileStorage = new MemoryFileStorage();

export async function getChaptersAsync() {
  return await prisma.chapter.findMany({
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getUserByIdAsync(id: number) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      azureADId: true,
      fullName: true,
      firstName: true,
      lastName: true,
      preferredName: true,
      email: true,
      mobile: true,
      addressStreet: true,
      addressSuburb: true,
      addressState: true,
      addressPostcode: true,
      dateOfBirth: true,
      emergencyContactName: true,
      emergencyContactNumber: true,
      emergencyContactAddress: true,
      emergencyContactRelationship: true,
      additionalEmail: true,
      profilePicturePath: true,
      volunteerAgreementSignedOn: true,
      hasApprovedToPublishPhotos: true,
      endDate: true,
      chapterId: true,
      chapter: {
        select: {
          id: true,
          name: true,
        },
      },
      approvalbyMRC: {
        select: {
          submittedDate: true,
        },
      },
      induction: {
        select: {
          completedOnDate: true,
        },
      },
      policeCheck: {
        select: {
          createdAt: true,
          expiryDate: true,
        },
      },
      references: {
        select: {
          calledOndate: true,
        },
      },
      welcomeCall: {
        select: {
          calledOnDate: true,
        },
      },
      wwcCheck: {
        select: {
          createdAt: true,
          expiryDate: true,
        },
      },
    },
  });
}

export async function updateUserByIdAsync(
  userId: number,
  dataUpdate: XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>,
) {
  return await prisma.user.update({
    data: dataUpdate,
    where: {
      id: userId,
    },
  });
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

export async function uploadHandler(fileUpload: FileUpload) {
  const storageKey = fileUpload.fieldName ?? "file";

  await memoryFileStorage.set(
    storageKey,
    new File([await fileUpload.bytes()], fileUpload.name, {
      type: fileUpload.type,
    }),
  );

  return memoryFileStorage.get(storageKey);
}
