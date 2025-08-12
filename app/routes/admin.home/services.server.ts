import type { AppAbility } from "~/services/.server";
import type { Term } from "~/models";

import dayjs from "dayjs";

import { Prisma } from "~/prisma/client";
import { prisma } from "~/db.server";
import { getDatesForTerm } from "~/services";
import { accessibleBy } from "~/casl-prisma";

interface Report {
  attendedOn: Date;
  reportWithFeedbackCounter: string;
  reportNoFeedbackCounter: string;
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

export async function getTotalMentorsAsync(
  year: number,
  chapterId: number | null,
  selectedTerm: Term | null,
) {
  return await prisma.mentor.count({
    where: {
      endDate: null,
      chapterId: chapterId ?? undefined,
      createdAt: selectedTerm
        ? {
            gte: selectedTerm.start.toDate(),
            lte: selectedTerm.end.toDate(),
          }
        : {
            gte: dayjs().year(year).startOf("year").toDate(),
            lte: dayjs().year(year).endOf("year").toDate(),
          },
    },
  });
}

export async function getIncompleteMentorsAsync(
  year: number,
  chapterId: number | null,
  selectedTerm: Term | null,
) {
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
          (SELECT COUNT(r.mentorId) FROM Reference r WHERE r.mentorId = u.id GROUP BY r.mentorId) as count,
          ap.id approvalbymrcId,
          p.id eoiprofileId,
          pc.id policecheckId,
          wcc.id wwccheckId,
          wc.id welcomecallId,
          i.id inductionId,
          c.id chapterId
        FROM Mentor u
        INNER JOIN Chapter c ON c.id = u.chapterId
        LEFT JOIN ApprovalbyMRC ap ON ap.mentorId = u.id
        LEFT JOIN EoIProfile p ON p.mentorId = u.id
        LEFT JOIN PoliceCheck pc ON pc.mentorId = u.id
        LEFT JOIN WWCCheck wcc ON wcc.mentorId = u.id
        LEFT JOIN WelcomeCall wc ON wc.mentorId = u.id
        LEFT JOIN Induction i ON i.mentorId = u.id
    ) as s
    WHERE endDate IS NULL
      AND ${chapterId ? Prisma.sql`chapterId = ${chapterId}` : "1=1"}
      AND ${selectedTerm ? Prisma.sql`createdAt BETWEEN ${selectedTerm.start.format("YYYY-MM-DD")} AND ${selectedTerm.end.format("YYYY-MM-DD")}` : Prisma.sql`createdAt BETWEEN ${dayjs().year(year).startOf("year").format("YYYY-MM-DD")} AND ${dayjs().year(year).endOf("year").format("YYYY-MM-DD")}`}
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

export async function getTotalStudentsAsync(
  year: number,
  chapterId: number | null,
  selectedTerm: Term | null,
) {
  return await prisma.student.count({
    where: {
      endDate: null,
      chapterId: chapterId ?? undefined,
      createdAt: selectedTerm
        ? {
            gte: selectedTerm.start.toDate(),
            lte: selectedTerm.end.toDate(),
          }
        : {
            gte: dayjs().year(year).startOf("year").toDate(),
            lte: dayjs().year(year).endOf("year").toDate(),
          },
    },
  });
}

export async function getStudentsWithoutMentorAsync(
  year: number,
  chapterId: number | null,
  selectedTerm: Term | null,
) {
  const countQuery = await prisma.$queryRaw<{ count: number }[]>`
    SELECT COUNT(DISTINCT s.id) AS count
    FROM Student AS s
    LEFT JOIN MentorToStudentAssignement AS m ON s.id = m.studentId
    WHERE m.studentId IS NULL
      AND s.endDate IS NULL
      AND ${chapterId ? Prisma.sql`s.chapterId = ${chapterId}` : "1=1"}
      AND ${selectedTerm ? Prisma.sql`s.createdAt BETWEEN ${selectedTerm.start.format("YYYY-MM-DD")} AND ${selectedTerm.end.format("YYYY-MM-DD")}` : Prisma.sql`s.createdAt BETWEEN ${dayjs().year(year).startOf("year").format("YYYY-MM-DD")} AND ${dayjs().year(year).endOf("year").format("YYYY-MM-DD")}`}`;

  return Number(countQuery[0].count);
}

export async function getTotalChaptersAsync() {
  return await prisma.chapter.count();
}

export async function getMentorsPerMonth(
  year: number,
  chapterId: number | null,
  selectedTerm: Term | null,
) {
  const mentors = await prisma.mentor.findMany({
    select: {
      createdAt: true,
    },
    where: {
      chapterId: chapterId ?? undefined,
      createdAt: selectedTerm
        ? {
            gte: selectedTerm.start.toDate(),
            lte: selectedTerm.end.toDate(),
          }
        : {
            gte: dayjs().year(year).startOf("year").toDate(),
            lte: dayjs().year(year).endOf("year").toDate(),
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
  year: number,
  chapterId: number | null,
  selectedTerm: Term | null,
) {
  const reports = await prisma.$queryRaw<Report[]>`SELECT
      s.attendedOn,
      SUM(IF(s.report IS NOT NULL AND s.signedOffOn IS NOT NULL, 1, 0)) reportWithFeedbackCounter,
      SUM(IF(s.report IS NOT NULL AND s.signedOffOn IS NULL, 1, 0)) reportNoFeedbackCounter,
      SUM(IF(s.report IS NULL, 1, 0)) noReportCounter
    FROM Session s
    WHERE s.isCancelled = 0
      AND ${chapterId ? Prisma.sql`s.chapterId = ${chapterId}` : "1=1"}
      AND ${selectedTerm ? Prisma.sql`s.attendedOn BETWEEN ${selectedTerm.start.format("YYYY-MM-DD")} AND ${selectedTerm.end.format("YYYY-MM-DD")}` : Prisma.sql`s.attendedOn BETWEEN ${dayjs().year(year).startOf("year").format("YYYY-MM-DD")} AND ${dayjs().year(year).endOf("year").format("YYYY-MM-DD")}`}
    GROUP BY s.attendedOn
    ORDER BY s.attendedOn ASC`;

  const sessionDates = getDatesForTerm(
    selectedTerm ? selectedTerm.start : dayjs().startOf("year"),
    selectedTerm ? selectedTerm.end : dayjs().endOf("year"),
  );

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
      noReportCounter: "0",
      reportNoFeedbackCounter: "0",
      reportWithFeedbackCounter: "0",
    };
  });
}

export async function sessionsStatsAsync(
  year: number,
  chapterId: number | null,
  selectedTerm: Term | null,
) {
  const sessionStats = await prisma.$queryRaw<
    {
      sessionCount: number;
      reportCount: number;
      minAttendedOn: string;
    }[]
  >`
    SELECT 
      COUNT(*) sessionCount,
      COUNT(s.report) reportCount,
      MIN(s.attendedOn) minAttendedOn
    FROM MentorSession ms
    INNER JOIN Session s ON s.mentorSessionId = ms.id
    WHERE ms.status = 'AVAILABLE'
      AND s.attendedOn <= ${dayjs().format("YYYY-MM-DD")}
      AND s.isCancelled = 0
      AND ${chapterId ? Prisma.sql`ms.chapterId = ${chapterId}` : "1=1"}
      AND ${selectedTerm ? Prisma.sql`s.attendedOn BETWEEN ${selectedTerm.start.format("YYYY-MM-DD")} AND ${selectedTerm.end.format("YYYY-MM-DD")}` : Prisma.sql`s.attendedOn BETWEEN ${dayjs().year(year).startOf("year").format("YYYY-MM-DD")} AND ${dayjs().year(year).endOf("year").format("YYYY-MM-DD")}`}`;

  return sessionStats?.[0] ?? null;
}
