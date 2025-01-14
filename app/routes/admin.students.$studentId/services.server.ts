import type {
  Prisma,
  Student,
  StudentGuardian,
  StudentTeacher,
} from "@prisma/client";

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
  return await prisma.student.findUnique({
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

export async function deleteGuardianByIdAsync(
  guardianId: StudentGuardian["id"],
) {
  return await prisma.studentGuardian.delete({
    where: {
      id: guardianId,
    },
  });
}

export async function deleteTeacherByIdAsync(teacherId: StudentTeacher["id"]) {
  return await prisma.studentTeacher.delete({
    where: {
      id: teacherId,
    },
  });
}
