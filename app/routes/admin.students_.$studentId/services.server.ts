import type { Prisma, Student } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getStudentByIdAsync(id: number) {
  return await prisma.student.findUnique({
    where: {
      id,
    },
    select: {
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      gender: true,
      address: true,
      allergies: true,
      hasApprovedToPublishPhotos: true,
      bestPersonToContact: true,
      bestContactMethod: true,
      schoolName: true,
      yearLevel: true,
      emergencyContactFullName: true,
      emergencyContactRelationship: true,
      emergencyContactPhone: true,
      emergencyContactEmail: true,
      emergencyContactAddress: true,
      startDate: true,
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
      studentAtChapter: {
        select: {
          chapter: {
            select: {
              name: true,
            },
          },
          chapterId: true,
          assignedAt: true,
          assignedBy: true,
        },
      },
    },
  });
}

export async function updateStudentByIdAsync(
  userId: Student["id"],
  dataUpdate: Prisma.XOR<
    Prisma.StudentUpdateInput,
    Prisma.StudentUncheckedUpdateInput
  >,
) {
  return await prisma.student.update({
    data: dataUpdate,
    where: {
      id: userId,
    },
  });
}

export async function createNewStudentAsync(
  dataCreate: Prisma.XOR<
    Prisma.StudentCreateInput,
    Prisma.StudentUncheckedCreateInput
  >,
) {
  return await prisma.student.create({
    data: dataCreate,
  });
}
