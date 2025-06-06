import type { AppAbility } from "~/services/.server";
import type { Term } from "~/models";

import dayjs from "dayjs";

import { prisma } from "~/db.server";
import { getDatesForTerm } from "~/services";
import { accessibleBy } from "~/casl-prisma";

interface Report {
  attendedOn: Date;
  reportWithFeedbackCounter: string;
  reportNoFeedbackCounter: string;
  incompleteReportCounter: string;
  noReportCounter: string;
}

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
          (SELECT COUNT(r.userId) FROM Reference r WHERE r.userId = u.id GROUP BY r.userId) as count,
          ap.id approvalbymrcId,
          p.id eoiprofileId,
          pc.id policecheckId,
          wcc.id wwccheckId,
          wc.id welcomecallId,
          i.id inductionId,
          c.id chapterId
        FROM User u
        INNER JOIN Chapter c ON c.id = u.chapterId
        LEFT JOIN ApprovalbyMRC ap ON ap.userId = u.id
        LEFT JOIN EoIProfile p ON p.userId = u.id
        LEFT JOIN PoliceCheck pc ON pc.userId = u.id
        LEFT JOIN WWCCheck wcc ON wcc.userId = u.id
        LEFT JOIN WelcomeCall wc ON wc.userId = u.id
        LEFT JOIN Induction i ON i.userId = u.id
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

export async function getReportsPerSession(
  chapterId: number,
  selectedTerm: Term,
) {
  const reports = await prisma.$queryRawUnsafe<Report[]>(
    `
    SELECT
      s.attendedOn,
      SUM(IF(s.report IS NOT NULL AND s.signedOffOn IS NOT NULL AND s.completedOn IS NOT NULL, 1, 0)) reportWithFeedbackCounter,
      SUM(IF(s.report IS NOT NULL AND s.signedOffOn IS NULL AND s.completedOn IS NOT NULL, 1, 0)) reportNoFeedbackCounter,
      SUM(IF(s.report IS NOT NULL AND s.completedOn IS NULL, 1, 0)) incompleteReportCounter,
      SUM(IF(s.report IS NULL, 1, 0)) noReportCounter
    FROM SessionAttendance s
    WHERE s.attendedOn BETWEEN ? AND ? AND s.chapterId = ?
    GROUP BY s.attendedOn
    ORDER BY s.attendedOn ASC`,
    selectedTerm.start.format("YYYY-MM-DD"),
    selectedTerm.end.format("YYYY-MM-DD"),
    chapterId,
  );

  const sessionDates = getDatesForTerm(selectedTerm.start, selectedTerm.end);

  const reportsLookup = reports.reduce<Record<string, Report>>(
    (res, report) => {
      res[report.attendedOn.toISOString()] = report;
      return res;
    },
    {},
  );

  return sessionDates.map<Report>((date) => {
    if (reportsLookup[date]) {
      return reportsLookup[date];
    }

    return {
      attendedOn: new Date(date),
      incompleteReportCounter: "0",
      noReportCounter: "0",
      reportNoFeedbackCounter: "0",
      reportWithFeedbackCounter: "0",
    };
  });
}
