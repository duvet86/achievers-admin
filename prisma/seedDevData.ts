import dayjs from "dayjs";

import { type PrismaClient } from "./client/client";
import {
  CancelledEntity,
  Gender,
  MentorStatus,
  SessionStatus,
  TeachingSubject,
} from "./client/enums";

const CHAPTERS = [
  {
    name: "Girrawheen",
    slug: "girrawheen",
    school: "Girrawheen Primary School",
    suburb: "Girrawheen",
    postcode: "6064",
  },
  {
    name: "Armadale",
    slug: "armadale",
    school: "Westfield Park Primary School",
    suburb: "Camillo",
    postcode: "6111",
  },
  {
    name: "Butler",
    slug: "butler",
    school: "East Butler Primary School",
    suburb: "Butler",
    postcode: "6036",
  },
] as const;

const MENTORS_PER_CHAPTER = 40;
const STUDENTS_PER_CHAPTER = 20;
const SESSIONS_PER_CHAPTER = 8;
const DEV_DOMAIN = "local.test";
const DEV_ADMIN = "Dev Admin";

const FIRST_NAMES = [
  // Anglo / European
  ["Amelia", Gender.FEMALE],
  ["Arlo", Gender.MALE],
  ["Bianca", Gender.FEMALE],
  ["Caleb", Gender.MALE],
  ["Chloe", Gender.FEMALE],
  ["Dylan", Gender.MALE],
  ["Eli", Gender.MALE],
  ["Grace", Gender.FEMALE],
  ["Hannah", Gender.FEMALE],
  ["Isaac", Gender.MALE],
  ["Lachlan", Gender.MALE],
  ["Leo", Gender.MALE],
  ["Mila", Gender.FEMALE],
  ["Noah", Gender.MALE],
  ["Olivia", Gender.FEMALE],
  ["Riley", Gender.FEMALE],
  ["Sam", Gender.MALE],
  ["Theo", Gender.MALE],
  ["Ava", Gender.FEMALE],
  ["Henry", Gender.MALE],
  ["Matteo", Gender.MALE],
  ["Sofia", Gender.FEMALE],
  ["Lucia", Gender.FEMALE],
  ["Niamh", Gender.FEMALE],
  ["Sebastian", Gender.MALE],
  // Arabic / Middle Eastern
  ["Aaliyah", Gender.FEMALE],
  ["Abdul", Gender.MALE],
  ["Asha", Gender.FEMALE],
  ["Farah", Gender.FEMALE],
  ["Fatima", Gender.FEMALE],
  ["Layla", Gender.FEMALE],
  ["Zara", Gender.FEMALE],
  ["Omar", Gender.MALE],
  ["Yusuf", Gender.MALE],
  ["Nadia", Gender.FEMALE],
  ["Hamza", Gender.MALE],
  ["Mariam", Gender.FEMALE],
  // South Asian
  ["Priya", Gender.FEMALE],
  ["Arjun", Gender.MALE],
  ["Anika", Gender.FEMALE],
  ["Rohan", Gender.MALE],
  ["Diya", Gender.FEMALE],
  ["Vihaan", Gender.MALE],
  ["Ishaan", Gender.MALE],
  ["Aanya", Gender.FEMALE],
  // East / Southeast Asian
  ["Kai", Gender.MALE],
  ["Mei", Gender.FEMALE],
  ["Hiro", Gender.MALE],
  ["Linh", Gender.FEMALE],
  ["Minh", Gender.MALE],
  ["Sora", Gender.FEMALE],
  ["Jun", Gender.MALE],
  ["Ji-woo", Gender.FEMALE],
  // African
  ["Imani", Gender.FEMALE],
  ["Amara", Gender.FEMALE],
  ["Kwame", Gender.MALE],
  ["Zola", Gender.FEMALE],
  ["Tariro", Gender.FEMALE],
  ["Sefu", Gender.MALE],
  ["Adaeze", Gender.FEMALE],
  ["Kofi", Gender.MALE],
  // Pacific / Māori
  ["Tane", Gender.MALE],
  ["Moana", Gender.FEMALE],
  ["Sione", Gender.MALE],
  ["Mere", Gender.FEMALE],
  // First Nations Australian
  ["Jarrah", Gender.MALE],
  ["Kira", Gender.FEMALE],
  ["Allira", Gender.FEMALE],
  ["Bindi", Gender.FEMALE],
  // Latin American
  ["Carmen", Gender.FEMALE],
  ["Mateus", Gender.MALE],
  ["Valentina", Gender.FEMALE],
  ["Diego", Gender.MALE],
  // Gender-neutral
  ["Jade", Gender.FEMALE],
  ["Tahlia", Gender.FEMALE],
  ["Maya", Gender.FEMALE],
] as const;

const LAST_NAMES = [
  // Anglo / European
  "Bennett",
  "Anderson",
  "Brown",
  "Campbell",
  "Clark",
  "Davis",
  "Evans",
  "Hughes",
  "Harris",
  "Martin",
  "Mitchell",
  "Roberts",
  "Taylor",
  "Thomas",
  "Walker",
  "Williams",
  "Wilson",
  "Wright",
  "Young",
  "O'Brien",
  "Kowalski",
  "Rossi",
  "Schmidt",
  "Andersson",
  // Arabic / Middle Eastern
  "Ahmed",
  "Khan",
  "Al-Rashid",
  "Hassan",
  "Mansour",
  "Haddad",
  // South Asian
  "Patel",
  "Singh",
  "Sharma",
  "Reddy",
  "Kaur",
  "Gupta",
  // East / Southeast Asian
  "Chen",
  "Lee",
  "Nguyen",
  "Tran",
  "Wang",
  "Kim",
  "Tanaka",
  "Suzuki",
  // African
  "Okafor",
  "Mwangi",
  "Adeyemi",
  "Dlamini",
  "Mensah",
  "Abara",
  // Pacific / Māori
  "Tuilagi",
  "Ngata",
  "Faleolo",
  // Latin American
  "Garcia",
  "Rodriguez",
  "Santos",
  "Fernandez",
  // First Nations Australian
  "Yunupingu",
  "Walgan",
] as const;

const STREET_NAMES = [
  "Banksia Street",
  "Discovery Drive",
  "Forrest Road",
  "Hakea Court",
  "Jarrah Way",
  "Marri Crescent",
  "Somerville Parade",
  "Tuart Avenue",
] as const;

const SKILL_LABELS = [
  "Homework support",
  "Reading",
  "Writing",
  "Maths",
  "Creative activities",
  "Sport",
] as const;

type ChapterConfig = (typeof CHAPTERS)[number];
interface SeededStudent {
  id: number;
  firstName: string;
  lastName: string;
}
interface SeededMentor {
  id: number;
  firstName: string;
  lastName: string;
}

function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function createUniqueGenerators() {
  const usedNames = new Set<string>();
  const usedPhoneNumbers = new Set<string>();
  const usedAddresses = new Set<string>();
  let phoneIndex = 0;
  let addressIndex = 0;

  function nextPhoneNumber() {
    let candidate;
    do {
      candidate = `04${String(10000000 + phoneIndex).slice(-8)}`;
      phoneIndex += 1;
    } while (usedPhoneNumbers.has(candidate));
    usedPhoneNumbers.add(candidate);
    return candidate;
  }

  function nextAddress(chapter: ChapterConfig) {
    // The street number strictly increases on every call, so every generated
    // address is unique by construction (the Set is kept as a safety net and to
    // guard against collisions with the guardian-address suffixes below).
    const streetName = STREET_NAMES[addressIndex % STREET_NAMES.length];
    const number = 12 + addressIndex;
    addressIndex += 1;

    const street = `${number} ${streetName}`;
    const full = `${street}, ${chapter.suburb} WA ${chapter.postcode}`;
    usedAddresses.add(full);

    return {
      street,
      suburb: chapter.suburb,
      state: "WA",
      postcode: chapter.postcode,
      full,
    };
  }

  function nextName() {
    const maxCombinations = FIRST_NAMES.length * LAST_NAMES.length;
    if (usedNames.size >= maxCombinations) {
      throw new Error(
        `Exhausted unique name combinations (${maxCombinations}) for dev seed data. Add more first/last names.`,
      );
    }

    let candidate;
    let firstName;
    let lastName;
    let gender: (typeof FIRST_NAMES)[number][1];

    for (;;) {
      [firstName, gender] = FIRST_NAMES[randomInt(FIRST_NAMES.length)];
      lastName = LAST_NAMES[randomInt(LAST_NAMES.length)];
      candidate = `${firstName} ${lastName}`;
      if (!usedNames.has(candidate)) {
        usedNames.add(candidate);
        return { firstName, lastName, gender };
      }
    }
  }

  function nextGuardianAddress(studentAddress: string, shouldMatch = true) {
    if (shouldMatch) {
      return studentAddress;
    }
    let candidate;
    do {
      const suffix = ["Unit 1", "Unit 2", "Flat B", "Rear", "Cottage"][
        randomInt(5)
      ];
      candidate = `${studentAddress} ${suffix}`;
    } while (usedAddresses.has(candidate));
    usedAddresses.add(candidate);
    return candidate;
  }

  return {
    nextName,
    nextPhoneNumber,
    nextAddress,
    nextGuardianAddress,
  };
}

function devMentorEmail(chapter: ChapterConfig, index: number) {
  return `dev.${chapter.slug}.mentor${index + 1}@${DEV_DOMAIN}`;
}

function devStudentEmail(chapter: ChapterConfig, index: number) {
  return `dev.${chapter.slug}.student${index + 1}@${DEV_DOMAIN}`;
}

function allDevMentorEmails() {
  return CHAPTERS.flatMap((chapter) =>
    Array.from({ length: MENTORS_PER_CHAPTER }, (_, index) =>
      devMentorEmail(chapter, index),
    ),
  );
}

function allDevStudentEmails() {
  return CHAPTERS.flatMap((chapter) =>
    Array.from({ length: STUDENTS_PER_CHAPTER }, (_, index) =>
      devStudentEmail(chapter, index),
    ),
  );
}

function sessionDates() {
  let cursor = dayjs().day(6).subtract(4, "week").startOf("day");
  return Array.from({ length: SESSIONS_PER_CHAPTER }, () => {
    const date = cursor.toDate();
    cursor = cursor.add(1, "week");
    return date;
  });
}

async function resetDevData(prisma: PrismaClient) {
  const devMentorIds = (
    await prisma.mentor.findMany({
      where: { email: { in: allDevMentorEmails() } },
      select: { id: true },
    })
  ).map(({ id }) => id);

  const devEoiStudentProfiles = await prisma.eoiStudentProfile.findMany({
    where: { email: { in: allDevStudentEmails() } },
    select: { id: true, Student: { select: { id: true } } },
  });
  const devEoiStudentProfileIds = devEoiStudentProfiles.map(({ id }) => id);
  const devStudentIds = devEoiStudentProfiles
    .map(({ Student }) => Student?.id)
    .filter((id): id is number => id !== undefined);

  const mentorSessionIds =
    devMentorIds.length === 0
      ? []
      : (
          await prisma.mentorSession.findMany({
            where: { mentorId: { in: devMentorIds } },
            select: { id: true },
          })
        ).map(({ id }) => id);
  const studentSessionIds =
    devStudentIds.length === 0
      ? []
      : (
          await prisma.studentSession.findMany({
            where: { studentId: { in: devStudentIds } },
            select: { id: true },
          })
        ).map(({ id }) => id);

  if (mentorSessionIds.length > 0 || studentSessionIds.length > 0) {
    await prisma.session.deleteMany({
      where: {
        OR: [
          { mentorSessionId: { in: mentorSessionIds } },
          { studentSessionId: { in: studentSessionIds } },
        ],
      },
    });
  }

  if (devMentorIds.length > 0) {
    await prisma.mentorAttendance.deleteMany({
      where: { mentorId: { in: devMentorIds } },
    });
    await prisma.mentorSession.deleteMany({
      where: { mentorId: { in: devMentorIds } },
    });
    await prisma.mentorToStudentAssignement.deleteMany({
      where: { mentorId: { in: devMentorIds } },
    });
    await prisma.goal.deleteMany({ where: { mentorId: { in: devMentorIds } } });
    await prisma.mentorShareInfo.deleteMany({
      where: {
        OR: [
          { mentorSharingId: { in: devMentorIds } },
          { mentorSharedToId: { in: devMentorIds } },
        ],
      },
    });
    await prisma.importedHistory.deleteMany({
      where: { mentorId: { in: devMentorIds } },
    });
    await prisma.mentorSkill.deleteMany({
      where: { mentorId: { in: devMentorIds } },
    });
    await prisma.mentorNote.deleteMany({
      where: { mentorId: { in: devMentorIds } },
    });
    await prisma.approvalbyMRC.deleteMany({
      where: { mentorId: { in: devMentorIds } },
    });
    await prisma.induction.deleteMany({
      where: { mentorId: { in: devMentorIds } },
    });
    await prisma.welcomeCall.deleteMany({
      where: { mentorId: { in: devMentorIds } },
    });
    await prisma.reference.deleteMany({
      where: { mentorId: { in: devMentorIds } },
    });
    await prisma.wWCCheck.deleteMany({
      where: { mentorId: { in: devMentorIds } },
    });
    await prisma.policeCheck.deleteMany({
      where: { mentorId: { in: devMentorIds } },
    });
    await prisma.eoIProfile.deleteMany({
      where: { mentorId: { in: devMentorIds } },
    });
    await prisma.mentor.deleteMany({ where: { id: { in: devMentorIds } } });
  }

  if (devStudentIds.length > 0) {
    await prisma.studentAttendance.deleteMany({
      where: { studentId: { in: devStudentIds } },
    });
    await prisma.studentSession.deleteMany({
      where: { studentId: { in: devStudentIds } },
    });
    await prisma.mentorToStudentAssignement.deleteMany({
      where: { studentId: { in: devStudentIds } },
    });
    await prisma.goal.deleteMany({
      where: { studentId: { in: devStudentIds } },
    });
    await prisma.studentSchoolReport.deleteMany({
      where: { studentId: { in: devStudentIds } },
    });
    await prisma.studentGrade.deleteMany({
      where: { studentId: { in: devStudentIds } },
    });
    await prisma.importedStudentHistory.deleteMany({
      where: { studentId: { in: devStudentIds } },
    });
    await prisma.studentGuardian.deleteMany({
      where: { studentId: { in: devStudentIds } },
    });
    await prisma.studentTeacher.deleteMany({
      where: { studentId: { in: devStudentIds } },
    });
    await prisma.student.deleteMany({ where: { id: { in: devStudentIds } } });
  }

  if (devEoiStudentProfileIds.length > 0) {
    await prisma.studentGuardian.deleteMany({
      where: { eoiStudentProfileId: { in: devEoiStudentProfileIds } },
    });
    await prisma.studentTeacher.deleteMany({
      where: { eoiStudentProfileId: { in: devEoiStudentProfileIds } },
    });
    await prisma.eoiStudentProfile.deleteMany({
      where: { id: { in: devEoiStudentProfileIds } },
    });
  }
}

async function seedMentors(
  prisma: PrismaClient,
  chapter: ChapterConfig & { id: number },
  skillIds: number[],
  unique: ReturnType<typeof createUniqueGenerators>,
) {
  const mentors: SeededMentor[] = [];
  const completed = dayjs().subtract(2, "month").toDate();

  for (let index = 0; index < MENTORS_PER_CHAPTER; index += 1) {
    const { firstName, lastName } = unique.nextName();
    const address = unique.nextAddress(chapter);
    const isArchived = index === 0;
    const isBlocked = index === 1;
    const missingSecondReference = index === 2;
    const missingMrcApproval = index === 3;
    const missingWelcomeCall = index === 4;
    const missingInduction = index === 5;
    const hasExpiringChecks = index === 6;
    const expiryDate = dayjs()
      .add(hasExpiringChecks ? 21 : 370 + randomInt(120), "day")
      .toDate();

    const mentor = await prisma.mentor.create({
      data: {
        email: devMentorEmail(chapter, index),
        firstName,
        lastName,
        preferredName: index % 5 === 0 ? firstName : null,
        mobile: unique.nextPhoneNumber(),
        addressStreet: address.street,
        addressSuburb: address.suburb,
        addressState: address.state,
        addressPostcode: address.postcode,
        additionalEmail: `alternate.${chapter.slug}.mentor${index + 1}@${DEV_DOMAIN}`,
        dateOfBirth: dayjs()
          .subtract(22 + (index % 32), "year")
          .subtract(randomInt(300), "day")
          .toDate(),
        frequencyInDays: index % 4 === 0 ? 14 : 7,
        emergencyContactName: `Emergency contact ${index + 1}`,
        emergencyContactNumber: unique.nextPhoneNumber(),
        emergencyContactAddress: unique.nextAddress(chapter).full,
        emergencyContactRelationship: "Friend",
        nextOfKinName: `Next of kin ${index + 1}`,
        nextOfKinNumber: unique.nextPhoneNumber(),
        nextOfKinAddress: unique.nextAddress(chapter).full,
        nextOfKinRelationship: "Parent",
        hasApprovedToPublishPhotos: index % 7 !== 0,
        volunteerAgreementSignedOn:
          index === 7 ? null : dayjs().subtract(1, "year").toDate(),
        skillOther: index % 11 === 0 ? "Board games" : null,
        status: isArchived
          ? MentorStatus.ARCHIVED
          : isBlocked
            ? MentorStatus.BLOCKED
            : null,
        endDate: isArchived ? dayjs().subtract(1, "month").toDate() : null,
        chapterId: chapter.id,
        eoIProfile: {
          create: {
            bestTimeToContact: "Weekday evenings",
            occupation: "Community volunteer",
            volunteerExperience: "Has supported school and community programs.",
            role: "Mentor",
            mentoringLevel: index % 2 === 0 ? "Primary school" : "High school",
            heardAboutUs: "Friend or colleague",
            preferredFrequency: index % 4 === 0 ? "Fortnightly" : "Weekly",
            preferredSubject: index % 3 === 0 ? "Maths" : "English",
            isOver18: true,
            comment: "Dev seed mentor profile.",
            wasMentor: index % 6 === 0 ? "Yes" : "No",
            linkedInProfile: null,
            aboutMe:
              "Enjoys helping students build confidence through practical goals.",
          },
        },
      },
    });

    await prisma.mentorNote.create({
      data: {
        mentorId: mentor.id,
        note:
          index % 8 === 0
            ? "Dev note: follow up on onboarding detail."
            : "Dev note: regular mentor profile.",
      },
    });

    await prisma.mentorSkill.createMany({
      data: [0, 1, 2].map((offset) => ({
        mentorId: mentor.id,
        skillId: skillIds[(index + offset) % skillIds.length],
      })),
    });

    await prisma.policeCheck.create({
      data: {
        mentorId: mentor.id,
        expiryDate,
        filePath: `/dev/police-checks/${chapter.slug}-${index + 1}.pdf`,
      },
    });
    await prisma.wWCCheck.create({
      data: {
        mentorId: mentor.id,
        wwcNumber: `WWC-${chapter.slug.toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
        expiryDate,
        filePath: `/dev/wwc-checks/${chapter.slug}-${index + 1}.pdf`,
      },
    });

    if (!missingWelcomeCall) {
      await prisma.welcomeCall.create({
        data: {
          mentorId: mentor.id,
          calledBy: DEV_ADMIN,
          calledOnDate: completed,
          comment: "Completed in dev seed.",
        },
      });
    }
    if (!missingInduction) {
      await prisma.induction.create({
        data: {
          mentorId: mentor.id,
          runBy: DEV_ADMIN,
          completedOnDate: completed,
          comment: "Completed in dev seed.",
        },
      });
    }
    if (!missingMrcApproval) {
      await prisma.approvalbyMRC.create({
        data: {
          mentorId: mentor.id,
          completedBy: DEV_ADMIN,
          submittedDate: completed,
          comment: "Approved in dev seed.",
        },
      });
    }

    const referenceCount = missingSecondReference ? 1 : 2;
    for (
      let referenceIndex = 0;
      referenceIndex < referenceCount;
      referenceIndex += 1
    ) {
      const referenceName = unique.nextName();
      await prisma.reference.create({
        data: {
          mentorId: mentor.id,
          firstName: referenceName.firstName,
          lastName: referenceName.lastName,
          mobile: unique.nextPhoneNumber(),
          email: `ref${referenceIndex + 1}.${chapter.slug}.mentor${index + 1}@${DEV_DOMAIN}`,
          relationship: referenceIndex === 0 ? "Colleague" : "Friend",
          bestTimeToContact: "Afternoons",
          generalComment: "Reference checked for dev seed.",
          outcomeComment: "Recommended.",
          skillAndKnowledgeComment: "Clear communicator.",
          empathyAndPatienceComment: "Patient and warm.",
          buildRelationshipsComment: "Builds rapport quickly.",
          knownForComment: "Known for reliability.",
          safeWithChildren: "Yes",
          hasKnowApplicantForAYear: true,
          isRelated: false,
          isMentorRecommended: true,
          calledBy: DEV_ADMIN,
          calledOndate: completed,
        },
      });
    }

    mentors.push({
      id: mentor.id,
      firstName: mentor.firstName,
      lastName: mentor.lastName,
    });
  }

  return mentors;
}

async function seedStudents(
  prisma: PrismaClient,
  chapter: ChapterConfig & { id: number },
  schoolTermId: number,
  unique: ReturnType<typeof createUniqueGenerators>,
) {
  const students: SeededStudent[] = [];

  for (let index = 0; index < STUDENTS_PER_CHAPTER; index += 1) {
    const { firstName, lastName, gender } = unique.nextName();
    const address = unique.nextAddress(chapter);
    const dateOfBirth = dayjs()
      .subtract(9 + (index % 5), "year")
      .subtract(randomInt(240), "day")
      .toDate();
    const yearLevel = 4 + (index % 4);
    const studentEmail = devStudentEmail(chapter, index);

    const eoi = await prisma.eoiStudentProfile.create({
      data: {
        firstName,
        lastName,
        preferredName: index % 6 === 0 ? firstName : null,
        dateOfBirth,
        gender,
        mobile: unique.nextPhoneNumber(),
        email: studentEmail,
        address: address.full,
        dietaryRequirements: index % 9 === 0 ? "No nuts" : "None",
        isEnglishMainLanguage: index % 5 !== 0,
        otherLanguagesSpoken: index % 5 === 0 ? "Arabic" : "None",
        bestPersonToContact: "Guardian",
        bestPersonToContactForEmergency: "Guardian",
        yearLevel: String(yearLevel),
        favouriteSchoolSubject: index % 2 === 0 ? "Science" : "Art",
        leastFavouriteSchoolSubject: index % 2 === 0 ? "Writing" : "Maths",
        supportReason: "Would benefit from confidence and homework support.",
        otherSupport: "School learning support team.",
        alreadyInAchievers: "No",
        heardAboutUs: "School",
        schoolName: chapter.school,
        weeklyCommitment: true,
        hasApprovedToPublishPhotos: index % 8 !== 0,
        chapterId: chapter.id,
      },
    });

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        gender,
        startDate: dayjs().subtract(6, "month").toDate(),
        dateOfBirth,
        address: address.full,
        allergies: index % 9 === 0,
        hasApprovedToPublishPhotos: index % 8 !== 0,
        bestPersonToContact: "Guardian",
        bestContactMethod: "Phone",
        schoolName: chapter.school,
        yearLevel,
        emergencyContactFullName: `Guardian of ${firstName}`,
        emergencyContactRelationship: "Parent",
        emergencyContactPhone: unique.nextPhoneNumber(),
        emergencyContactEmail: `guardian.${chapter.slug}.student${index + 1}@${DEV_DOMAIN}`,
        emergencyContactAddress: address.full,
        chapterId: chapter.id,
        eoiStudentProfileId: eoi.id,
      },
    });

    await prisma.studentGuardian.createMany({
      data: [
        {
          studentId: student.id,
          eoiStudentProfileId: eoi.id,
          fullName: `Guardian ${lastName}`,
          preferredName: null,
          relationship: "Parent",
          phone: unique.nextPhoneNumber(),
          email: `guardian.${chapter.slug}.student${index + 1}@${DEV_DOMAIN}`,
          address: unique.nextGuardianAddress(address.full, index % 7 !== 0),
        },
        {
          studentId: student.id,
          eoiStudentProfileId: eoi.id,
          fullName: `Backup ${lastName}`,
          preferredName: null,
          relationship: "Grandparent",
          phone: unique.nextPhoneNumber(),
          email: `backup.${chapter.slug}.student${index + 1}@${DEV_DOMAIN}`,
          address: unique.nextGuardianAddress(address.full, index % 5 !== 0),
        },
      ],
    });

    await prisma.studentTeacher.createMany({
      data: [
        {
          studentId: student.id,
          eoiStudentProfileId: eoi.id,
          fullName: "Ms Harper",
          email: `teacher.${chapter.slug}.english${index + 1}@${DEV_DOMAIN}`,
          schoolName: chapter.school,
          subject: TeachingSubject.ENGLISH,
        },
        {
          studentId: student.id,
          eoiStudentProfileId: eoi.id,
          fullName: "Mr Clarke",
          email: `teacher.${chapter.slug}.math${index + 1}@${DEV_DOMAIN}`,
          schoolName: chapter.school,
          subject: TeachingSubject.MATH,
        },
      ],
    });

    await prisma.studentGrade.createMany({
      data: ["English", "Maths", "Science"].map((subject, subjectIndex) => ({
        studentId: student.id,
        year: dayjs().year(),
        semester: subjectIndex % 2 === 0 ? "Semester 1" : "Semester 2",
        subject,
        grade: ["A", "B", "C"][randomInt(3)],
      })),
    });

    await prisma.studentSchoolReport.create({
      data: {
        studentId: student.id,
        schoolTermId,
        label: `${chapter.school} report`,
        filePath: `/dev/student-reports/${chapter.slug}-${index + 1}.pdf`,
      },
    });

    students.push({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
    });
  }

  return students;
}

async function seedAssignmentsAndGoals(
  prisma: PrismaClient,
  chapterId: number,
  mentors: SeededMentor[],
  students: SeededStudent[],
) {
  const assignments: { mentor: SeededMentor; student: SeededStudent }[] = [];

  for (
    let studentIndex = 0;
    studentIndex < students.length - 1;
    studentIndex += 1
  ) {
    const firstMentor = mentors[studentIndex * 2];
    const secondMentor = mentors[studentIndex * 2 + 1];
    for (const mentor of [firstMentor, secondMentor]) {
      await prisma.mentorToStudentAssignement.create({
        data: {
          mentorId: mentor.id,
          studentId: students[studentIndex].id,
          assignedBy: DEV_ADMIN,
          assignedAt: dayjs().subtract(3, "month").toDate(),
        },
      });
      assignments.push({ mentor, student: students[studentIndex] });
    }
  }

  await prisma.goal.createMany({
    data: students.slice(0, -1).map((student, index) => {
      const mentor = mentors[index * 2];
      return {
        chapterId,
        mentorId: mentor.id,
        studentId: student.id,
        title: `Confidence goal for ${student.firstName}`,
        goal: "Complete one agreed learning activity each week and reflect on progress.",
        result:
          index % 4 === 0
            ? "Student is engaging well with the activity."
            : null,
        isAchieved: index % 9 === 0,
        endDate: dayjs()
          .add(3 + (index % 3), "month")
          .toDate(),
      };
    }),
  });

  return assignments;
}

async function seedRoster(
  prisma: PrismaClient,
  chapterId: number,
  mentors: SeededMentor[],
  students: SeededStudent[],
  assignments: { mentor: SeededMentor; student: SeededStudent }[],
  cancelledReasonId: number,
) {
  const today = dayjs().startOf("day");

  for (const [dateIndex, attendedOn] of sessionDates().entries()) {
    const isPast = dayjs(attendedOn).isBefore(today);
    const mentorSessions = new Map<
      number,
      { id: number; status: (typeof SessionStatus)[keyof typeof SessionStatus] }
    >();
    const studentSessions = new Map<
      number,
      { id: number; status: (typeof SessionStatus)[keyof typeof SessionStatus] }
    >();

    for (const [mentorIndex, mentor] of mentors.entries()) {
      const status =
        mentorIndex === dateIndex % mentors.length
          ? SessionStatus.UNAVAILABLE
          : mentorIndex === (dateIndex + 11) % mentors.length
            ? SessionStatus.PENDING
            : SessionStatus.AVAILABLE;
      const mentorSession = await prisma.mentorSession.create({
        data: {
          chapterId,
          mentorId: mentor.id,
          attendedOn,
          status,
        },
      });
      mentorSessions.set(mentor.id, { id: mentorSession.id, status });
    }

    for (const [studentIndex, student] of students.entries()) {
      const status =
        studentIndex === (dateIndex + 3) % students.length
          ? SessionStatus.UNAVAILABLE
          : SessionStatus.AVAILABLE;
      const studentSession = await prisma.studentSession.create({
        data: {
          chapterId,
          studentId: student.id,
          attendedOn,
          status,
          reason:
            status === SessionStatus.UNAVAILABLE ? "Family commitment" : null,
        },
      });
      studentSessions.set(student.id, { id: studentSession.id, status });
    }

    const attendedMentors = new Set<number>();
    const attendedStudents = new Set<number>();

    for (const [
      assignmentIndex,
      { mentor, student },
    ] of assignments.entries()) {
      const mentorSession = mentorSessions.get(mentor.id);
      const studentSession = studentSessions.get(student.id);
      if (
        mentorSession === undefined ||
        studentSession === undefined ||
        mentorSession.status !== SessionStatus.AVAILABLE ||
        studentSession.status !== SessionStatus.AVAILABLE
      ) {
        continue;
      }

      const isCancelled = assignmentIndex % 17 === dateIndex % 5;
      const hasReport = isPast && !isCancelled && assignmentIndex % 5 !== 0;

      await prisma.session.create({
        data: {
          chapterId,
          mentorSessionId: mentorSession.id,
          studentSessionId: studentSession.id,
          attendedOn,
          report: hasReport
            ? `<p>${mentor.firstName} worked with ${student.firstName} on reading, numeracy, and confidence.</p>`
            : null,
          completedOn: isPast && !isCancelled ? attendedOn : null,
          notificationSentOn: dayjs(attendedOn).subtract(2, "day").toDate(),
          reportFeedback:
            hasReport && assignmentIndex % 7 === 0
              ? "Useful detail for dev review."
              : null,
          signedOffOn:
            hasReport && assignmentIndex % 6 === 0
              ? dayjs(attendedOn).add(2, "day").toDate()
              : null,
          signedOffByAzureId:
            hasReport && assignmentIndex % 6 === 0 ? "dev-admin" : null,
          cancelledBecauseOf: isCancelled
            ? assignmentIndex % 2 === 0
              ? CancelledEntity.MENTOR
              : CancelledEntity.STUDENT
            : null,
          cancelledAt: isCancelled
            ? dayjs(attendedOn).subtract(1, "day").toDate()
            : null,
          cancelledReasonId: isCancelled ? cancelledReasonId : null,
        },
      });

      if (isPast && !isCancelled) {
        attendedMentors.add(mentor.id);
        attendedStudents.add(student.id);
      }
    }

    for (const mentorId of attendedMentors) {
      await prisma.mentorAttendance.create({
        data: { chapterId, mentorId, attendedOn },
      });
    }
    for (const studentId of attendedStudents) {
      await prisma.studentAttendance.create({
        data: { chapterId, studentId, attendedOn },
      });
    }
  }
}

export async function seedDevData(prisma: PrismaClient) {
  await resetDevData(prisma);
  const unique = createUniqueGenerators();

  const chapters = await prisma.chapter.findMany({
    where: { name: { in: CHAPTERS.map((chapter) => chapter.name) } },
    select: { id: true, name: true },
  });
  const chapterIdsByName = new Map(chapters.map(({ id, name }) => [name, id]));

  const schoolTerm = await prisma.schoolTerm.findFirstOrThrow({
    orderBy: { startDate: "desc" },
    select: { id: true },
  });

  const cancelledReason = await prisma.sessionCancelledReason.findFirstOrThrow({
    where: { reason: "Absent WITH notice" },
    select: { id: true },
  });

  const skills = await Promise.all(
    SKILL_LABELS.map((label) =>
      prisma.skill.upsert({
        where: { label },
        create: { label },
        update: {},
        select: { id: true },
      }),
    ),
  );
  const skillIds = skills.map(({ id }) => id);

  for (const chapterConfig of CHAPTERS) {
    const id = chapterIdsByName.get(chapterConfig.name);
    if (id === undefined) {
      throw new Error(`Missing baseline chapter: ${chapterConfig.name}`);
    }

    const chapter = { ...chapterConfig, id };
    const mentors = await seedMentors(prisma, chapter, skillIds, unique);
    const students = await seedStudents(prisma, chapter, schoolTerm.id, unique);
    const assignments = await seedAssignmentsAndGoals(
      prisma,
      chapter.id,
      mentors,
      students,
    );
    await seedRoster(
      prisma,
      chapter.id,
      mentors,
      students,
      assignments,
      cancelledReason.id,
    );

    console.info(
      `Dev data seeded for ${chapter.name}: ${mentors.length} mentors, ${students.length} students, ${assignments.length} assignments.`,
    );
  }
}

// delete from tables in this order: session,mentorattendance,studentattendance,mentorsession,studentsession,mentortostudentassignement,goal,studentschoolreport,studentgrade,importedstudenthistory,studentguardian,studentteacher,mentorshareinfo,importedhistory,mentorskill,mentornote,approvalbymrc,induction,welcomecall,reference,wwccheck,policecheck,eoiprofile,mentor,student,eoistudentprofile
