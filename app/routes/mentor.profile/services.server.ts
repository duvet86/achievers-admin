import type { FileUpload } from "@mjackson/form-data-parser";

import { MemoryFileStorage } from "@mjackson/file-storage/memory";

import { prisma } from "~/db.server";

const memoryFileStorage = new MemoryFileStorage();

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      id: true,
      fullName: true,
      profilePicturePath: true,
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
      volunteerAgreementSignedOn: true,
      hasApprovedToPublishPhotos: true,
      chapter: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
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
