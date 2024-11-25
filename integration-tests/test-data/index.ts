import { PrismaClient } from "@prisma/client";

import { createUsersAsync } from "./users";
import { createStudentsAsync } from "./students";
import { assignMentorsToStudentsAsync } from "./mentor-to-sudent-assignement";
import { mentorAsync } from "./mentor";

export const CHAPTER_DATA: Record<string, string> = {
  Girrawheen: "1",
  Armadale: "2",
  Butler: "3",
};

export async function seedDataAsync(isMentor = false) {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();

    await createUsersAsync(prisma, process.env.TEST_MENTOR_AZURE_ID!);
    await createStudentsAsync(prisma);

    await assignMentorsToStudentsAsync(prisma);

    if (isMentor) {
      await mentorAsync(prisma);
    }
  } catch (e) {
    console.log(e);
  } finally {
    await prisma.$disconnect();
  }
}

export async function seedBookSessionAsync() {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();

    await prisma.$transaction(async (tx) => {
      await tx.studentSession.deleteMany();
      await tx.session.deleteMany();

      const testMentor = await tx.user.findUniqueOrThrow({
        where: {
          email: "test_0@test.com",
        },
        select: {
          id: true,
          chapterId: true,
        },
      });

      const studentAssignment =
        await tx.mentorToStudentAssignement.findFirstOrThrow({
          where: {
            userId: testMentor.id,
          },
          select: {
            studentId: true,
          },
        });

      await tx.session.create({
        data: {
          attendedOn: new Date("2024-11-23T00:00:00.000Z"),
          chapterId: 1,
          mentorId: testMentor.id,
          studentSession: {
            create: {
              studentId: studentAssignment.studentId,
            },
          },
        },
      });
    });
  } catch (e) {
    console.log(e);
  } finally {
    await prisma.$disconnect();
  }
}
