import { prisma } from "~/db.server";

export async function getStudentEOIByIdAsync(id: number) {
  return await prisma.eoiStudentProfile.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
      Student: {
        select: {
          id: true,
        },
      },
    },
  });
}

export async function promoteStudentEOIByIdAsync(id: number) {
  const eoiStudent = await prisma.eoiStudentProfile.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      firstName: true,
      lastName: true,
      address: true,
      chapterId: true,
      dateOfBirth: true,
      gender: true,
      hasApprovedToPublishPhotos: true,
      schoolName: true,
    },
  });

  return await prisma.student.create({
    data: {
      firstName: eoiStudent.firstName,
      lastName: eoiStudent.lastName,
      address: eoiStudent.address,
      chapterId: eoiStudent.chapterId,
      dateOfBirth: eoiStudent.dateOfBirth,
      eoiStudentProfileId: id,
      gender: eoiStudent.gender === "MALE" ? "MALE" : "FEMALE",
      hasApprovedToPublishPhotos: eoiStudent.hasApprovedToPublishPhotos,
      schoolName: eoiStudent.schoolName,
    },
  });
}
