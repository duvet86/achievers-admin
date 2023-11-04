import type { Gender, Prisma, PrismaClient } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { makeAStudent, randomNumber } from "./utils";

export async function createStudentsAsync(
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
) {
  await prisma.$transaction(async (tx) => {
    await tx.importedStudentHistory.deleteMany();
    await tx.mentorToStudentAssignement.deleteMany();
    await tx.studentGuardian.deleteMany();
    await tx.studentTeacher.deleteMany();
    await tx.studentAtChapter.deleteMany();
    await tx.student.deleteMany();

    let i: number;

    for (i = 0; i < 18; i++) {
      const student = makeAStudent();
      await tx.student.create({
        data: {
          address: student.address,
          bestContactMethod: !randomNumber(1) ? "phone" : "email",
          bestPersonToContact: student.guardians[0].firstName,
          dateOfBirth: student.dateOfBirth,
          emergencyContactAddress: student.guardians[0].address,
          emergencyContactEmail: student.guardians[0].email,
          emergencyContactFullName: student.guardians[0].fullName,
          emergencyContactPhone: student.guardians[0].mobile,
          emergencyContactRelationship:
            student.guardians[0].relationshipToStudent,
          firstName: student.firstName,
          gender: student.sex.toUpperCase() as Gender,
          lastName: student.lastName,
          schoolName: student.school,
          startDate: new Date(),
          yearLevel: student.yearInSchool.toString(),
          allergies: !randomNumber(1),
          hasApprovedToPublishPhotos: !randomNumber(1),
          guardian: {
            createMany: {
              data: student.guardians.map((x) => ({
                address: x.address,
                email: x.email,
                fullName: x.fullName,
                phone: x.mobile,
                relationship: x.relationshipToStudent,
              })),
            },
          },
          studentTeacher: {
            createMany: {
              data: student.teachers.map((x) => ({
                email: x.email,
                fullName: x.fullName,
                schoolName: student.school,
              })),
            },
          },
          studentAtChapter: {
            create: {
              assignedBy: "test-data",
              chapterId: (await tx.chapter.findFirstOrThrow()).id,
            },
          },
        },
      });
    }
  });
}
