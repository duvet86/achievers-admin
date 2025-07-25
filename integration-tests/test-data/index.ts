import { resolve } from "node:path";
import { readFileSync } from "node:fs";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { PrismaClient } from "~/prisma/client";

import { createUsersAsync } from "./users";
import { createStudentsAsync } from "./students";
import { assignMentorsToStudentsAsync } from "./mentor-to-sudent-assignement";
import { mentorAsync } from "./mentor";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: 3306,
  connectionLimit: 5,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: true,
          ca: [
            readFileSync(
              resolve(process.cwd(), "prisma/DigiCertGlobalRootCA.crt.pem"),
              "utf8",
            ),
          ],
        }
      : undefined,
});

export const CHAPTER_DATA: Record<string, string> = {
  Girrawheen: "1",
  Armadale: "2",
  Butler: "3",
};

export async function seedDataAsync(isMentor = false) {
  const prisma = new PrismaClient({ adapter });

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
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();

    await prisma.$transaction(async (tx) => {
      await tx.session.deleteMany();
      await tx.mentorSession.deleteMany();
      await tx.studentSession.deleteMany();

      const testMentor = await tx.mentor.findUniqueOrThrow({
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
            mentorId: testMentor.id,
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

      await tx.session.create({
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
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();

    await prisma.$transaction(async (tx) => {
      await tx.session.deleteMany();
      await tx.mentorSession.deleteMany();
      await tx.studentSession.deleteMany();

      const testMentor = await tx.mentor.findUniqueOrThrow({
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
          mentorId: testMentor.id,
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

      await tx.session.create({
        data: {
          attendedOn: nextSessionDate,
          chapterId: 1,
          studentSessionId: studentNextSession.id,
          mentorSessionId: mentorNextSession.id,
        },
      });

      // Recent sessions

      const sessionDate1 = new Date("2024-11-23T00:00:00.000Z");

      const studentSession1 = await tx.studentSession.create({
        data: {
          chapterId: testMentor.chapterId,
          studentId: studentAssignments[1].studentId,
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

      await tx.session.create({
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
    });
  } catch (e) {
    console.log(e);
  } finally {
    await prisma.$disconnect();
  }
}
