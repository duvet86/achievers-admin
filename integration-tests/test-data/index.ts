import { PrismaClient } from "~/prisma/client";

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

    await prisma.$transaction(async (tx) => {
      await createUsersAsync(tx, process.env.TEST_MENTOR_AZURE_ID!);
      await createStudentsAsync(tx);

      await assignMentorsToStudentsAsync(tx);

      if (isMentor) {
        await mentorAsync(tx);
      }
    });
  } catch (e) {
    console.log(e);
  } finally {
    await prisma.$disconnect();
  }
}

export async function seedForWriteReportAsync() {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();

    await prisma.$transaction(async (tx) => {
      await tx.sessionAttendance.deleteMany();
      await tx.mentorSession.deleteMany();
      await tx.studentSession.deleteMany();

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

      const studentSession = await tx.studentSession.create({
        data: {
          chapterId: testMentor.chapterId,
          studentId: studentAssignment.studentId,
          attendedOn: new Date("2024-11-23T00:00:00.000Z"),
        },
      });

      const mentorSession = await tx.mentorSession.create({
        data: {
          chapterId: testMentor.chapterId,
          mentorId: testMentor.id,
          attendedOn: new Date("2024-11-23T00:00:00.000Z"),
        },
      });

      await tx.sessionAttendance.create({
        data: {
          attendedOn: new Date("2024-11-23T00:00:00.000Z"),
          chapterId: 1,
          studentSessionId: studentSession.id,
          mentorSessionId: mentorSession.id,
        },
      });
    });
  } catch (e) {
    console.log(e);
  } finally {
    await prisma.$disconnect();
  }
}

export async function seedSessionsFroHomePageAsync() {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();

    await prisma.$transaction(async (tx) => {
      await tx.sessionAttendance.deleteMany();
      await tx.mentorSession.deleteMany();
      await tx.studentSession.deleteMany();

      const testMentor = await tx.user.findUniqueOrThrow({
        where: {
          email: "test_0@test.com",
        },
        select: {
          id: true,
          chapterId: true,
        },
      });

      const studentAssignments = await tx.mentorToStudentAssignement.findMany({
        where: {
          userId: testMentor.id,
        },
        select: {
          studentId: true,
        },
      });

      // Next session
      const nextSessionDate = new Date("2024-11-30T00:00:00.000Z");

      const studentNextSession = await tx.studentSession.create({
        data: {
          chapterId: testMentor.chapterId,
          studentId: studentAssignments[0].studentId,
          attendedOn: nextSessionDate,
        },
      });

      const mentorNextSession = await tx.mentorSession.create({
        data: {
          chapterId: testMentor.chapterId,
          mentorId: testMentor.id,
          attendedOn: nextSessionDate,
        },
      });

      await tx.sessionAttendance.create({
        data: {
          attendedOn: nextSessionDate,
          chapterId: 1,
          studentSessionId: studentNextSession.id,
          mentorSessionId: mentorNextSession.id,
        },
      });

      // Recent sessions

      const sessionDate1 = new Date("2024-11-16T00:00:00.000Z");

      const studentSession1 = await tx.studentSession.create({
        data: {
          chapterId: testMentor.chapterId,
          studentId: studentAssignments[0].studentId,
          attendedOn: sessionDate1,
        },
      });

      const mentorSession1 = await tx.mentorSession.create({
        data: {
          chapterId: testMentor.chapterId,
          mentorId: testMentor.id,
          attendedOn: sessionDate1,
        },
      });

      await tx.sessionAttendance.create({
        data: {
          attendedOn: sessionDate1,
          chapterId: 1,
          studentSessionId: studentSession1.id,
          mentorSessionId: mentorSession1.id,
          report:
            '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Hello this is my first report!","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
          completedOn: new Date("2024-11-16T00:00:00.000Z"),
          signedOffOn: new Date("2024-11-18T00:00:00.000Z"),
        },
      });

      const sessionDate = new Date("2024-11-23T00:00:00.000Z");

      const studentSession = await tx.studentSession.create({
        data: {
          chapterId: testMentor.chapterId,
          studentId: studentAssignments[1].studentId,
          attendedOn: sessionDate,
        },
      });

      const mentorSession = await tx.mentorSession.create({
        data: {
          chapterId: testMentor.chapterId,
          mentorId: testMentor.id,
          attendedOn: sessionDate,
        },
      });

      await tx.sessionAttendance.create({
        data: {
          attendedOn: sessionDate,
          chapterId: 1,
          studentSessionId: studentSession.id,
          mentorSessionId: mentorSession.id,
          report:
            '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Hello this is my first report!","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
        },
      });
    });
  } catch (e) {
    console.log(e);
  } finally {
    await prisma.$disconnect();
  }
}
