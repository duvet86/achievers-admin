import dayjs from "dayjs";
import { type PrismaClient } from "./client/client";

function randomPhoneNumber() {
  return `04${Math.random()}.substr(2, 8)`;
}

function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function randomAddress() {
  const streetNames = ['Girrawheen Drive', 'Royal Court', 'Forrest Run', 'Vaya con Dios', 'Somerville Parade', 'Another Avenue', 'Baiting Lane', 'Miracle St', 'Soap Box Drive', 'Merryville Lane', 'Cross Crescent', 'Nimby Close', 'Highway to Help', 'Yolo Road', 'Crispy Dreams Street', 'Bacon Avenue'];
  const suburbs = ['Girrawheen', 'Balga', 'Padbury', 'Belmont', 'Joondalup', 'Stirling', 'Craigie', 'Balcatta', 'Morley', 'Wangara'];
  const number = randomInt(400) + 10;
  const street = streetNames[randomInt(streetNames.length)];
  const suburb = suburbs[randomInt(suburbs.length)];
  return [`${number} ${street}`, suburb];
}

function randomName() {
  const firstNames = ['Reynalda', 'Musa', 'Hienadz', 'Leyla', 'Pratima', 'Irene', 'Abdul', 'Qusay', 'Leda', 'Baggi', 'Jessie', 'Bret', 'Letitia', 'Iðunn', 'Augustin', 'Booker', 'Valter', 'Mark', 'Cináed', 'Augustine', 'Chlodochar', 'Ardith', 'Ruairidh', 'Presley', 'Erle', 'Jamil', 'Lauren', 'Lydia', 'Nicole', 'Erika'];
  const lastNames = ['Truman', 'Moore', 'Biškup', 'Ismail', 'Barbieri', 'Nordström', 'Spannagel', 'School', 'Feld', 'Thorsen', 'Jeanes', 'Wash', 'Moffett', 'Barron', 'Josephson', 'Groot', 'Speight', 'Beasley', 'Beck', 'Linville', 'MacMillan', 'Jordache', 'Foster', 'Woodham', 'Mercier', 'Dam', 'Steele', 'Brown', 'Pellé', 'Javier'];
  
  return [
    firstNames[Math.floor(Math.random() * firstNames.length)],
    lastNames[Math.floor(Math.random() * lastNames.length)],
  ]
}

export async function seedDevData(prisma: PrismaClient) {
  const chapter = await prisma.chapter.findUniqueOrThrow({
    where: { name: "Girrawheen" },
  });

  const mentorBase = {
    mobile: "0400000000",
    addressStreet: '1 Test St',
    addressSuburb: "Girrawheen",
    addressState: "WA",
    addressPostcode: "6064",
    chapterId: chapter.id,
    volunteerAgreementSignedOn: dayjs().subtract(1, "year").toDate(),
    hasApprovedToPublishPhotos: true,
  };

  const mentors = await Promise.all(
    [
      { email: "dev.mentor1@local.test" },
      { email: "dev.mentor2@local.test" },
      { email: "dev.mentor3@local.test" },
    ].map((record) => {
      const [ firstName, lastName ] = randomName();
      const mobile = randomPhoneNumber();
      const [ addressStreet, addressSuburb ] = randomAddress();
      return prisma.mentor.upsert({
        where: { email: record.email },
        create: { ...mentorBase, ...record, mobile, firstName, lastName, addressStreet, addressSuburb },
        update: {},
      });
    }),
  );

  for (const mentor of mentors) {
    const expiry = dayjs().add(1, "year").add(Math.floor(Math.random() * 50), "day").toDate();
    const completed = dayjs().subtract(2, "month").toDate();

    await prisma.policeCheck.upsert({
      where: { mentorId: mentor.id },
      create: { mentorId: mentor.id, expiryDate: expiry },
      update: {},
    });
    await prisma.wWCCheck.upsert({
      where: { mentorId: mentor.id },
      create: {
        mentorId: mentor.id,
        wwcNumber: `WWC-${mentor.id}`,
        expiryDate: expiry,
      },
      update: {},
    });
    await prisma.welcomeCall.upsert({
      where: { mentorId: mentor.id },
      create: {
        mentorId: mentor.id,
        calledBy: "Dev Admin",
        calledOnDate: completed,
      },
      update: {},
    });
    await prisma.induction.upsert({
      where: { mentorId: mentor.id },
      create: {
        mentorId: mentor.id,
        runBy: "Dev Admin",
        completedOnDate: completed,
      },
      update: {},
    });
    await prisma.approvalbyMRC.upsert({
      where: { mentorId: mentor.id },
      create: {
        mentorId: mentor.id,
        completedBy: "Dev Admin",
        submittedDate: completed,
      },
      update: {},
    });

    const refCount = await prisma.reference.count({
      where: { mentorId: mentor.id },
    });
    if (refCount === 0) {
      const [ firstName, lastName ] = randomName();
      const mobile = randomPhoneNumber();
      await prisma.reference.create({
        data: {
          mentorId: mentor.id,
          firstName,
          lastName,
          mobile,
          email: `ref.${mentor.email}`,
          relationship: "Colleague",
        },
      });
    }
  }

  const students = await Promise.all(
    [
      { firstName: "Sam", lastName: "Lee" },
      { firstName: "Maya", lastName: "Chen" },
      { firstName: "Jordan", lastName: "Wright" },
      { firstName: "Riley", lastName: "Patel" },
    ].map(async ({ firstName, lastName }) => {
      const existing = await prisma.student.findFirst({
        where: { firstName, lastName, chapterId: chapter.id },
      });
      if (existing) return existing;
      return prisma.student.create({
        data: {
          firstName,
          lastName,
          chapterId: chapter.id,
          gender: "MALE",
          startDate: dayjs().subtract(6, "month").toDate(),
          dateOfBirth: dayjs().subtract(12, "year").toDate(),
          schoolName: "Girrawheen Primary",
          yearLevel: 6,
          allergies: false,
          guardian: {
            create: [
              {
                fullName: `Parent of ${firstName}`,
                relationship: "Parent",
                phone: "0400000222",
                email: `parent.${firstName.toLowerCase()}@local.test`,
                address: "1 Test Street, Girrawheen WA 6064",
              },
            ],
          },
          studentTeacher: {
            create: [
              {
                fullName: "Ms. Teacher",
                email: "teacher@local.test",
                schoolName: "Girrawheen Primary",
                subject: "ENGLISH",
              },
            ],
          },
        },
      });
    }),
  );

  // Pair mentor1↔student1, mentor2↔student2
  for (const [mentor, student] of [
    [mentors[0], students[0]],
    [mentors[1], students[1]],
  ] as const) {
    await prisma.mentorToStudentAssignement.upsert({
      where: {
        mentorId_studentId: { mentorId: mentor.id, studentId: student.id },
      },
      create: {
        mentorId: mentor.id,
        studentId: student.id,
        assignedBy: "Dev Admin",
      },
      update: {},
    });
  }

  // 8 weekly Saturdays: 4 in the past, 4 in the future
  const sats: Date[] = [];
  let cursor = dayjs().day(6).subtract(4, "week"); // upcoming/this Saturday minus 4 weeks
  for (let i = 0; i < 8; i++) {
    sats.push(cursor.startOf("day").toDate());
    cursor = cursor.add(1, "week");
  }
  const today = dayjs().startOf("day");

  const pairs = [
    { mentor: mentors[0], student: students[0] },
    { mentor: mentors[1], student: students[1] },
  ];

  for (const attendedOn of sats) {
    const isPast = dayjs(attendedOn).isBefore(today);

    for (const { mentor, student } of pairs) {
      const ms = await prisma.mentorSession.upsert({
        where: {
          chapterId_mentorId_attendedOn: {
            chapterId: chapter.id,
            mentorId: mentor.id,
            attendedOn,
          },
        },
        create: {
          chapterId: chapter.id,
          mentorId: mentor.id,
          attendedOn,
          status: "AVAILABLE",
        },
        update: {},
      });

      const ss = await prisma.studentSession.upsert({
        where: {
          chapterId_studentId_attendedOn: {
            chapterId: chapter.id,
            studentId: student.id,
            attendedOn,
          },
        },
        create: {
          chapterId: chapter.id,
          studentId: student.id,
          attendedOn,
          status: "AVAILABLE",
        },
        update: {},
      });

      await prisma.session.upsert({
        where: {
          chapterId_mentorSessionId_studentSessionId: {
            chapterId: chapter.id,
            mentorSessionId: ms.id,
            studentSessionId: ss.id,
          },
        },
        create: {
          chapterId: chapter.id,
          mentorSessionId: ms.id,
          studentSessionId: ss.id,
          attendedOn,
          report: isPast
            ? `<p>Worked on reading comprehension with ${student.firstName}.</p>`
            : null,
          completedOn: isPast ? attendedOn : null,
        },
        update: {},
      });

      if (isPast) {
        await prisma.mentorAttendance.upsert({
          where: {
            chapterId_mentorId_attendedOn: {
              chapterId: chapter.id,
              mentorId: mentor.id,
              attendedOn,
            },
          },
          create: {
            chapterId: chapter.id,
            mentorId: mentor.id,
            attendedOn,
          },
          update: {},
        });
        await prisma.studentAttendance.upsert({
          where: {
            chapterId_studentId_attendedOn: {
              chapterId: chapter.id,
              studentId: student.id,
              attendedOn,
            },
          },
          create: {
            chapterId: chapter.id,
            studentId: student.id,
            attendedOn,
          },
          update: {},
        });
      }
    }
  }

  // Goals (no unique constraint — gate on count)
  const existingGoals = await prisma.goal.count({
    where: { chapterId: chapter.id },
  });
  if (existingGoals === 0) {
    await prisma.goal.createMany({
      data: pairs.map(({ mentor, student }) => ({
        chapterId: chapter.id,
        mentorId: mentor.id,
        studentId: student.id,
        title: `Improve reading for ${student.firstName}`,
        goal: "Read one short story per week and discuss it.",
        endDate: dayjs().add(3, "month").toDate(),
      })),
    });
  }

  console.info(
    `Dev data seeded: ${mentors.length} mentors, ${students.length} students, ${sats.length} saturdays.`,
  );
}