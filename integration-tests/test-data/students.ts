import type { Prisma, PrismaClient } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export async function createStudentsAsync(
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
) {
  await prisma.$transaction(async (tx) => {
    await tx.studentGuardian.deleteMany();
    await tx.studentTeacher.deleteMany();
    await tx.studentAtChapter.deleteMany();
    await tx.student.deleteMany();

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
          yearLevel: "1",
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
