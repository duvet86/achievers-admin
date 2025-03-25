import type { AppAbility } from "~/services/.server";

import { accessibleBy } from "@casl/prisma";
import dayjs from "dayjs";

import { prisma } from "~/db.server";

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function getChaptersAsync(ability: AppAbility) {
  return await prisma.chapter.findMany({
    where: accessibleBy(ability).Chapter,
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      id: "asc",
    },
  });
}

export async function getTotalMentorsAsync() {
  return await prisma.user.count({
    where: {
      endDate: null,
    },
  });
}

export async function getIncompleteMentorsAsync() {
  const countQuery = await prisma.$queryRaw<{ count: number }[]>`
    SELECT COUNT(*) count
    FROM
    (
      SELECT
          u.id,
          u.fullName,
          u.email,
          u.volunteerAgreementSignedOn,
          u.endDate,
          u.createdAt,
          c.name chapterName,
          pc.expiryDate policeCheckExpiryDate,
          pc.reminderSentAt policeCheckReminderSentAt,
          wcc.expiryDate wwccheckExpiryDate,
          wcc.reminderSentAt wwccheckReminderSent,
          (SELECT COUNT(r.userId) FROM achievers.Reference r WHERE r.userId = u.id GROUP BY r.userId) as count,
          ap.id approvalbymrcId,
          p.id eoiprofileId,
          pc.id policecheckId,
          wcc.id wwccheckId,
          wc.id welcomecallId,
          i.id inductionId,
          c.id chapterId
        FROM achievers.User u
        INNER JOIN achievers.Chapter c ON c.id = u.chapterId
        LEFT JOIN achievers.ApprovalbyMRC ap ON ap.userId = u.id
        LEFT JOIN achievers.EoIProfile p ON p.userId = u.id
        LEFT JOIN achievers.PoliceCheck pc ON pc.userId = u.id
        LEFT JOIN achievers.WWCCheck wcc ON wcc.userId = u.id
        LEFT JOIN achievers.WelcomeCall wc ON wc.userId = u.id
        LEFT JOIN achievers.Induction i ON i.userId = u.id
    ) as s
    WHERE endDate IS NULL
      AND (approvalbymrcId IS NULL 
      OR eoiprofileId IS NULL
      OR policecheckId IS NULL
      OR wwccheckId IS NULL
      OR welcomecallId IS NULL
      OR inductionId IS NULL
      OR volunteerAgreementSignedOn IS NULL
      OR count < 2)`;

  return Number(countQuery[0].count);
}

export async function getTotalStudentsAsync() {
  return await prisma.student.count({
    where: {
      endDate: null,
    },
  });
}

export async function getStudentsWithoutMentorAsync() {
  const countQuery = await prisma.$queryRaw<{ count: number }[]>`
    SELECT COUNT(DISTINCT s.id) AS count
    FROM Student AS s
    LEFT JOIN MentorToStudentAssignement AS m ON s.id = m.studentId
    WHERE m.studentId IS NULL AND s.endDate IS NULL;`;

  return Number(countQuery[0].count);
}

export async function getTotalChaptersAsync() {
  return await prisma.chapter.count();
}

export async function getMentorsPerMonth() {
  const mentors = await prisma.user.findMany({
    select: {
      createdAt: true,
    },
    where: {
      createdAt: {
        gte: dayjs().subtract(6, "months").toDate(),
      },
    },
  });

  const data = mentors.reduce<Record<string, number>>((res, { createdAt }) => {
    const label =
      MONTHS[dayjs(createdAt).month()] + " " + dayjs(createdAt).year();

    if (res[label] === undefined) {
      res[label] = 1;
    } else {
      res[label]++;
    }

    return res;
  }, {});

  return {
    x: Object.keys(data),
    y: Object.values(data),
  };
}

export async function getReportsPerSession(chapterId: number) {
  const currentTermQuery = await prisma.$queryRawUnsafe<
    {
      startDate: string;
      endDate: string;
    }[]
  >(
    `
    SELECT 
      MIN(startDate) startDate,
      MIN(endDate) endDate
    FROM achievers.SchoolTerm
    WHERE year = ? AND endDate >= NOW()
    GROUP BY year`,
    new Date().getFullYear(),
  );

  const reports = await prisma.$queryRawUnsafe<
    {
      attendedOn: string;
      reportCounter: string;
      noReportCounter: string;
    }[]
  >(
    `
    SELECT
      s.attendedOn,
      SUM(IF(st.hasReport = 1, 1, 0)) reportCounter,
      SUM(IF(st.hasReport = 0, 1, 0)) + SUM(IF(st.hasReport IS NULL, 1, 0)) noReportCounter
    FROM achievers.Session s
    LEFT JOIN achievers.StudentSession st ON st.sessionId = s.id
    WHERE s.attendedOn BETWEEN ? AND ? AND s.chapterId = ?
    GROUP BY s.attendedOn`,
    dayjs(currentTermQuery[0].startDate).format("YYYY-MM-DD"),
    dayjs(currentTermQuery[0].endDate).format("YYYY-MM-DD"),
    chapterId,
  );

  return reports;
}
