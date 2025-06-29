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

export async function getStudentByIdAsync(id: number) {
  return await prisma.student.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      gender: true,
      address: true,
      allergies: true,
      yearLevel: true,
      hasApprovedToPublishPhotos: true,
      bestPersonToContact: true,
      bestContactMethod: true,
      schoolName: true,
      emergencyContactFullName: true,
      emergencyContactRelationship: true,
      emergencyContactPhone: true,
      emergencyContactEmail: true,
      emergencyContactAddress: true,
      startDate: true,
      endDate: true,
      profilePicturePath: true,
      guardian: {
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
      chapterId: true,
      chapter: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function updateStudentByIdAsync(
  userId: number,
  dataUpdate: XOR<
    Prisma.StudentUpdateInput,
    Prisma.StudentUncheckedUpdateInput
  >,
): Promise<number> {
  const student = await prisma.student.update({
    data: dataUpdate,
    where: {
      id: userId,
    },
  });

  return student.id;
}

export async function createNewStudentAsync(
  dataCreate: XOR<
    Prisma.StudentCreateInput,
    Prisma.StudentUncheckedCreateInput
  >,
): Promise<number> {
  const student = await prisma.student.create({
    data: dataCreate,
  });

  return student.id;
}

export async function deleteGuardianByIdAsync(guardianId: number) {
  return await prisma.studentGuardian.delete({
    where: {
      id: guardianId,
    },
  });
}

export async function deleteTeacherByIdAsync(teacherId: number) {
  return await prisma.studentTeacher.delete({
    where: {
      id: teacherId,
    },
  });
}
