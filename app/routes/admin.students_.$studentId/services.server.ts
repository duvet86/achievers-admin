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
  dataCreate: Prisma.XOR<
    Prisma.StudentCreateInput,
    Prisma.StudentUncheckedCreateInput
  >,
): Promise<number> {
  const student = await prisma.student.create({
    data: dataCreate,
  });

  return student.id;
}
