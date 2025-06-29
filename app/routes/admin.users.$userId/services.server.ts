import type { Prisma } from "~/prisma/client";
import type { XOR } from "~/models";

import { prisma } from "~/db.server";

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
      frequencyInDays: true,
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
