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

export async function getStudentEOIByIdAsync(id: number) {
  return await prisma.eoiStudentProfile.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      gender: true,
      address: true,
      yearLevel: true,
      hasApprovedToPublishPhotos: true,
      bestPersonToContact: true,
      alreadyInAchievers: true,
      bestPersonToContactForEmergency: true,
      dietaryRequirements: true,
      email: true,
      favouriteSchoolSubject: true,
      heardAboutUs: true,
      isEnglishMainLanguage: true,
      leastFavouriteSchoolSubject: true,
      mobile: true,
      otherLanguagesSpoken: true,
      otherSupport: true,
      preferredName: true,
      supportReason: true,
      weeklyCommitment: true,
      chapterId: true,
      studentGuardian: {
        select: {
          id: true,
          fullName: true,
          relationship: true,
        },
      },
      studentTeacher: {
        select: {
          id: true,
          fullName: true,
          schoolName: true,
        },
      },
      chapter: {
        select: {
          id: true,
          name: true,
        },
      },
      Student: {
        select: {
          id: true,
        },
      },
    },
  });
}

export async function updateStudentEOIByIdAsync(
  studentId: number,
  dataUpdate: XOR<
    Prisma.EoiStudentProfileUpdateInput,
    Prisma.EoiStudentProfileUncheckedUpdateInput
  >,
): Promise<number> {
  const student = await prisma.eoiStudentProfile.update({
    data: dataUpdate,
    where: {
      id: studentId,
    },
  });

  return student.id;
}
