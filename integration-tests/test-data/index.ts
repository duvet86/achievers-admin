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
});

export const CHAPTER_DATA: Record<string, string> = {
  Girrawheen: "1",
  Armadale: "2",
  Butler: "3",
  "Head Office": "4",
};

export async function seedDataAsync(isMentor = false) {
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();

    await prisma.$transaction(
      async (tx) => {
        await createUsersAsync(tx, process.env.TEST_MENTOR_AZURE_ID!);
        await createStudentsAsync(tx);

        await assignMentorsToStudentsAsync(tx);

        if (isMentor) {
          await mentorAsync(tx);
        }
      },
      {
        maxWait: 10000, // 10 seconds default
        timeout: 30000, // 30 seconds default
      },
    );
  } catch (e) {
    console.log(e);

    // Do not run tests against stale data.
    throw e;
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
      await tx.volunteerSession.deleteMany();
      await tx.studentSession.deleteMany();

      const testVolunteer = await tx.volunteer.findUniqueOrThrow({
        where: {
          email: "test_0@test.com",
        },
        select: {
          id: true,
          chapterId: true,
        },
      });

      const studentAssignment =
        await tx.volunteerToStudentAssignement.findFirstOrThrow({
          where: {
            volunteerId: testVolunteer.id,
          },
          select: {
            studentId: true,
          },
        });

      const studentSession = await tx.studentSession.create({
        data: {
          chapterId: testVolunteer.chapterId,
          studentId: studentAssignment.studentId,
          attendedOn: new Date("2024-11-23T00:00:00.000Z"),
        },
      });

      const volunteerSession = await tx.volunteerSession.create({
        data: {
          chapterId: testVolunteer.chapterId,
          volunteerId: testVolunteer.id,
          attendedOn: new Date("2024-11-23T00:00:00.000Z"),
        },
      });

      await tx.session.create({
        data: {
          attendedOn: new Date("2024-11-23T00:00:00.000Z"),
          chapterId: 1,
          studentSessionId: studentSession.id,
          volunteerSessionId: volunteerSession.id,
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
      await tx.volunteerSession.deleteMany();
      await tx.studentSession.deleteMany();

      const testVolunteer = await tx.volunteer.findUniqueOrThrow({
        where: {
          email: "test_0@test.com",
        },
        select: {
          id: true,
          chapterId: true,
        },
      });

      const studentAssignments =
        await tx.volunteerToStudentAssignement.findMany({
          where: {
            volunteerId: testVolunteer.id,
          },
          select: {
            studentId: true,
          },
        });

      // Next session
      const nextSessionDate = new Date("2024-11-30T00:00:00.000Z");

      const studentNextSession = await tx.studentSession.create({
        data: {
          chapterId: testVolunteer.chapterId,
          studentId: studentAssignments[0].studentId,
          attendedOn: nextSessionDate,
        },
      });

      const volunteerNextSession = await tx.volunteerSession.create({
        data: {
          chapterId: testVolunteer.chapterId,
          volunteerId: testVolunteer.id,
          attendedOn: nextSessionDate,
        },
      });

      await tx.session.create({
        data: {
          attendedOn: nextSessionDate,
          chapterId: 1,
          studentSessionId: studentNextSession.id,
          volunteerSessionId: volunteerNextSession.id,
        },
      });

      // Recent sessions

      const sessionDate1 = new Date("2024-11-23T00:00:00.000Z");

      const studentSession1 = await tx.studentSession.create({
        data: {
          chapterId: testVolunteer.chapterId,
          studentId: studentAssignments[1].studentId,
          attendedOn: sessionDate1,
        },
      });

      const volunteerSession1 = await tx.volunteerSession.create({
        data: {
          chapterId: testVolunteer.chapterId,
          volunteerId: testVolunteer.id,
          attendedOn: sessionDate1,
        },
      });

      await tx.session.create({
        data: {
          attendedOn: sessionDate1,
          chapterId: 1,
          studentSessionId: studentSession1.id,
          volunteerSessionId: volunteerSession1.id,
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

const REPORT_JSON =
  '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Hello this is my first report!","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}';

// One session of test_0 for each state of the session summaries list, all in
// the past (the server date is mocked to 2024-11-24):
// - 2024-11-23 student_0: outstanding, no report yet.
// - 2024-11-16 student_1: report submitted, requires sign off.
// - 2024-11-09 student_2: report submitted and signed off.
export async function seedSessionsForAdminAsync() {
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();

    await prisma.$transaction(
      async (tx) => {
        await tx.session.deleteMany();
        await tx.volunteerSession.deleteMany();
        await tx.studentSession.deleteMany();

        const testVolunteer = await tx.volunteer.findUniqueOrThrow({
          where: {
            email: "test_0@test.com",
          },
          select: {
            id: true,
            chapterId: true,
          },
        });

        const studentAssignments =
          await tx.volunteerToStudentAssignement.findMany({
            where: {
              volunteerId: testVolunteer.id,
            },
            select: {
              studentId: true,
            },
            orderBy: {
              studentId: "asc",
            },
          });

        const sessions = [
          {
            attendedOn: new Date("2024-11-23T00:00:00.000Z"),
            studentId: studentAssignments[0].studentId,
          },
          {
            attendedOn: new Date("2024-11-16T00:00:00.000Z"),
            studentId: studentAssignments[1].studentId,
            report: REPORT_JSON,
            completedOn: new Date("2024-11-17T12:00:00.000Z"),
          },
          {
            attendedOn: new Date("2024-11-09T00:00:00.000Z"),
            studentId: studentAssignments[2].studentId,
            report: REPORT_JSON,
            completedOn: new Date("2024-11-10T12:00:00.000Z"),
            signedOffOn: new Date("2024-11-12T12:00:00.000Z"),
          },
        ];

        for (const { attendedOn, studentId, ...sessionData } of sessions) {
          const studentSession = await tx.studentSession.create({
            data: {
              chapterId: testVolunteer.chapterId,
              studentId,
              attendedOn,
            },
          });

          const volunteerSession = await tx.volunteerSession.create({
            data: {
              chapterId: testVolunteer.chapterId,
              volunteerId: testVolunteer.id,
              attendedOn,
            },
          });

          await tx.session.create({
            data: {
              attendedOn,
              chapterId: testVolunteer.chapterId,
              studentSessionId: studentSession.id,
              volunteerSessionId: volunteerSession.id,
              ...sessionData,
            },
          });
        }
      },
      {
        maxWait: 10000,
        timeout: 30000,
      },
    );
  } catch (e) {
    console.log(e);

    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

// Two goals of test_0 and one of its students: one open, one achieved.
export async function seedGoalsAsync() {
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();

    await prisma.$transaction(async (tx) => {
      await tx.goal.deleteMany();

      const testVolunteer = await tx.volunteer.findUniqueOrThrow({
        where: {
          email: "test_0@test.com",
        },
        select: {
          id: true,
          chapterId: true,
        },
      });

      const studentAssignments =
        await tx.volunteerToStudentAssignement.findMany({
          where: {
            volunteerId: testVolunteer.id,
          },
          select: {
            studentId: true,
          },
          orderBy: {
            studentId: "asc",
          },
        });

      await tx.goal.createMany({
        data: [
          {
            chapterId: testVolunteer.chapterId,
            volunteerId: testVolunteer.id,
            studentId: studentAssignments[0].studentId,
            title: "Read one book",
            goal: REPORT_JSON,
            endDate: new Date("2024-12-01T00:00:00.000Z"),
          },
          {
            chapterId: testVolunteer.chapterId,
            volunteerId: testVolunteer.id,
            studentId: studentAssignments[1].studentId,
            title: "Learn the times tables",
            goal: REPORT_JSON,
            result: "All done, well done!",
            isAchieved: true,
            endDate: new Date("2024-11-15T00:00:00.000Z"),
          },
        ],
      });
    });
  } catch (e) {
    console.log(e);

    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

// School terms are not part of the seed data, tests that add terms need to
// remove them.
export async function deleteSchoolTermsAsync(year: number) {
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();

    await prisma.schoolTerm.deleteMany({
      where: {
        year,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

// A student expression of interest, with a guardian and a teacher.
export async function seedStudentEoiAsync() {
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();

    await prisma.$transaction(async (tx) => {
      await tx.eoiStudentProfile.deleteMany();

      const chapterId = (await tx.chapter.findFirstOrThrow()).id;

      await tx.eoiStudentProfile.create({
        data: {
          firstName: "Eoi",
          lastName: "Student",
          preferredName: "Eoi pref",
          dateOfBirth: new Date("2014-05-12T00:00:00.000Z"),
          gender: "MALE",
          mobile: "0400111222",
          email: "eoi@test.com",
          address: "1 Eoi street",
          dietaryRequirements: "None",
          isEnglishMainLanguage: true,
          otherLanguagesSpoken: "Italian",
          bestPersonToContact: "Mum",
          bestPersonToContactForEmergency: "Dad",
          yearLevel: "5",
          favouriteSchoolSubject: "Maths",
          leastFavouriteSchoolSubject: "Art",
          supportReason: "Needs help with reading",
          otherSupport: "None",
          alreadyInAchievers: "No",
          heardAboutUs: "A friend",
          schoolName: "Eoi school",
          weeklyCommitment: true,
          hasApprovedToPublishPhotos: true,
          chapterId,
          studentGuardian: {
            create: {
              fullName: "Eoi Guardian",
              relationship: "mother",
              phone: "0400333444",
              email: "guardian@eoi.com",
              address: "1 Eoi street",
            },
          },
          studentTeacher: {
            create: {
              fullName: "Eoi Teacher",
              email: "teacher@eoi.com",
              schoolName: "Eoi school",
            },
          },
        },
      });
    });
  } catch (e) {
    console.log(e);

    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

// test_1 shares its email and mobile with test_0.
export async function seedPartnerSharedInfoAsync() {
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();

    await prisma.$transaction(async (tx) => {
      await tx.volunteerShareInfo.deleteMany();

      const [sharing, sharedTo] = await Promise.all([
        tx.volunteer.findUniqueOrThrow({
          where: { email: "test_1@test.com" },
          select: { id: true },
        }),
        tx.volunteer.findUniqueOrThrow({
          where: { email: "test_0@test.com" },
          select: { id: true },
        }),
      ]);

      await tx.volunteerShareInfo.create({
        data: {
          volunteerSharingId: sharing.id,
          volunteerSharedToId: sharedTo.id,
        },
      });
    });
  } catch (e) {
    console.log(e);

    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

export const MENTOR_RESOURCE_CATEGORY = "Integration tests resources";

// Mentor resources are not part of the seed data, tests that add them need to
// remove them.
export async function seedMentorResourcesAsync() {
  await deleteMentorResourcesAsync();

  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();

    await prisma.volunteerResourceCategory.create({
      data: {
        label: MENTOR_RESOURCE_CATEGORY,
        order: 999,
        volunteerResource: {
          createMany: {
            data: [
              {
                label: "Reading tips",
                description: "How to read with your student",
                url: "https://example.com/reading",
                order: 1,
              },
              {
                label: "Maths games",
                description: "Games to practice maths",
                url: "https://example.com/maths",
                order: 2,
              },
            ],
          },
        },
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteMentorResourcesAsync() {
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();

    await prisma.volunteerResource.deleteMany({
      where: {
        volunteerResourcesCategory: {
          label: MENTOR_RESOURCE_CATEGORY,
        },
      },
    });
    await prisma.volunteerResourceCategory.deleteMany({
      where: {
        label: MENTOR_RESOURCE_CATEGORY,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Three sessions of test_0 with student_0, all with a submitted report.
export async function seedSessionsOfStudentAsync() {
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();

    await prisma.$transaction(async (tx) => {
      await tx.session.deleteMany();
      await tx.volunteerSession.deleteMany();
      await tx.studentSession.deleteMany();

      const testVolunteer = await tx.volunteer.findUniqueOrThrow({
        where: {
          email: "test_0@test.com",
        },
        select: {
          id: true,
          chapterId: true,
        },
      });

      const studentAssignment =
        await tx.volunteerToStudentAssignement.findFirstOrThrow({
          where: {
            volunteerId: testVolunteer.id,
          },
          select: {
            studentId: true,
          },
          orderBy: {
            studentId: "asc",
          },
        });

      for (const day of ["2024-11-02", "2024-11-09", "2024-11-16"]) {
        const attendedOn = new Date(`${day}T00:00:00.000Z`);

        const studentSession = await tx.studentSession.create({
          data: {
            chapterId: testVolunteer.chapterId,
            studentId: studentAssignment.studentId,
            attendedOn,
          },
        });

        const volunteerSession = await tx.volunteerSession.create({
          data: {
            chapterId: testVolunteer.chapterId,
            volunteerId: testVolunteer.id,
            attendedOn,
          },
        });

        await tx.session.create({
          data: {
            attendedOn,
            chapterId: testVolunteer.chapterId,
            studentSessionId: studentSession.id,
            volunteerSessionId: volunteerSession.id,
            report: REPORT_JSON,
            completedOn: new Date(`${day}T12:00:00.000Z`),
          },
        });
      }
    });
  } catch (e) {
    console.log(e);

    throw e;
  } finally {
    await prisma.$disconnect();
  }
}
