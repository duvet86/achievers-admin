import type { Prisma, PrismaClient } from "~/prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export async function createStudentsAsync(
  tx: Omit<
    PrismaClient<never, Prisma.GlobalOmitConfig | undefined, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
  >,
) {
  await tx.importedStudentHistory.deleteMany();
  await tx.mentorToStudentAssignement.deleteMany();
  await tx.studentGuardian.deleteMany();
  await tx.studentTeacher.deleteMany();
  await tx.studentAttendance.deleteMany();
  await tx.studentSchoolReport.deleteMany();
  await tx.studentGrade.deleteMany();

  await tx.student.deleteMany();
  await tx.$queryRaw`ALTER TABLE Student AUTO_INCREMENT = 1;`;

  let i: number;

  for (i = 0; i < 18; i++) {
    await tx.student.create({
      data: {
        address: "address",
        bestContactMethod: "phone",
        bestPersonToContact: "Tony",
        dateOfBirth: new Date(),
        emergencyContactAddress: "emergency address",
        emergencyContactEmail: "emergency@asd.com",
        emergencyContactFullName: "Luca M",
        emergencyContactPhone: "123456",
        emergencyContactRelationship: "father",
        firstName: `student_${i}`,
        gender: "MALE",
        lastName: `student_lastname_${i}`,
        schoolName: `school_${i}`,
        startDate: new Date(),
        allergies: true,
        hasApprovedToPublishPhotos: true,
        guardian: {
          createMany: {
            data: [
              {
                address: "address",
                email: "asd@asd.com",
                fullName: "Lolo",
                phone: "123456",
                relationship: "mother",
              },
              {
                address: "address 2",
                email: "asd2@asd2.com",
                fullName: "Lolo2",
                phone: "123456",
                relationship: "mother2",
              },
            ],
          },
        },
        studentTeacher: {
          createMany: {
            data: [
              {
                email: "asd@asd.com",
                fullName: "Pippo",
                schoolName: "Schoole 1",
              },
              {
                email: "asd2@asd2.com",
                fullName: "Pippo2",
                schoolName: "Schoole 2",
              },
            ],
          },
        },
        chapterId: (await tx.chapter.findFirstOrThrow()).id,
        createdAt: new Date(2024, 10, 24, 0, 0),
      },
    });
  }
}
