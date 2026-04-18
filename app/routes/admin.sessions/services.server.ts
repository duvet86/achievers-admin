import type { AppAbility } from "~/services/.server";
import type { Term } from "~/models";

import { prisma } from "~/db.server";
import { accessibleBy } from "~/casl-prisma";
import { Prisma } from "~/prisma/client";

interface DBOption {
  id: number;
  fullName: string;
}

export async function getChaptersAsync(ability: AppAbility) {
  return await prisma.chapter.findMany({
    where: accessibleBy(ability).Chapter,
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getAvailabelMentorsAsync(
  ability: AppAbility,
  chapterId: number | undefined,
  studentId: number | undefined,
) {
  const chapterIdFilter = accessibleBy(ability).Chapter.id ?? chapterId;

  let sessions: DBOption[] = [];

  if (studentId) {
    sessions = await prisma.$queryRaw<DBOption[]>`
      SELECT 
        m.id, m.fullName
      FROM Session sa
      INNER JOIN MentorSession ms ON ms.id = sa.mentorSessionId
      INNER JOIN StudentSession ss ON ss.id = sa.studentSessionId
      INNER JOIN Mentor m ON m.id = ms.mentorId
      WHERE ss.studentId = ${studentId} AND ${chapterId ? Prisma.sql`sa.chapterId = ${chapterId}` : "1=1"}
      GROUP BY m.id, m.fullName
      ORDER BY m.fullName ASC`;
  }

  const dbOptions = await prisma.$queryRaw<DBOption[]>`
    SELECT DISTINCT
      m.id, m.fullName
    FROM Mentor m
    INNER JOIN MentorToStudentAssignement msa ON msa.mentorId = m.id
    WHERE ${sessions.length > 0 ? Prisma.sql`m.id NOT IN (${Prisma.join(sessions.map((s) => s.id))})` : "1=1"}
      AND ${chapterIdFilter ? Prisma.sql`m.chapterId = ${chapterIdFilter}` : "1=1"}
    ORDER BY m.fullName ASC`;

  return sessions.concat(dbOptions);
}

export async function getAvailabelStudentsAsync(
  ability: AppAbility,
  chapterId: number | undefined,
  mentorId: number | undefined,
) {
  const chapterIdFilter = accessibleBy(ability).Chapter.id ?? chapterId;

  let sessions: DBOption[] = [];

  if (mentorId) {
    sessions = await prisma.$queryRaw<DBOption[]>`
      SELECT 
        s.id, s.fullName
      FROM Session sa
      INNER JOIN MentorSession ms ON ms.id = sa.mentorSessionId
      INNER JOIN StudentSession ss ON ss.id = sa.studentSessionId
      INNER JOIN Student s ON s.id = ss.studentId
      WHERE ms.mentorId = ${mentorId} AND ${chapterId ? Prisma.sql`sa.chapterId = ${chapterId}` : "1=1"}
      GROUP BY s.id, s.fullName
      ORDER BY s.fullName ASC`;
  }

  const dbOptions = await prisma.$queryRaw<DBOption[]>`
    SELECT DISTINCT
      s.id, s.fullName
    FROM Student s
    INNER JOIN MentorToStudentAssignement msa ON msa.studentId = s.id
    WHERE ${sessions.length > 0 ? Prisma.sql`s.id NOT IN (${Prisma.join(sessions.map((s) => s.id))})` : "1=1"}
      AND ${chapterIdFilter ? Prisma.sql`s.chapterId = ${chapterIdFilter}` : "1=1"}
    ORDER BY s.fullName ASC`;

  return sessions.concat(dbOptions);
}

export async function getCountAsync(
  term: Term,
  chapterId: number | undefined,
  termDate: string | undefined,
  mentorId: number | undefined,
  studentId: number | undefined,
  filterReports: string,
) {
  return await prisma.session.count({
    where: whereClause(
      term,
      chapterId,
      termDate,
      mentorId,
      studentId,
      filterReports,
    ),
  });
}

export async function getSessionsAsync(
  term: Term,
  chapterId: number | undefined,
  termDate: string | undefined,
  mentorId: number | undefined,
  studentId: number | undefined,
  filterReports: string,
  pageNumber: number,
  numberItems = 10,
) {
  return await prisma.session.findMany({
    where: whereClause(
      term,
      chapterId,
      termDate,
      mentorId,
      studentId,
      filterReports,
    ),
    select: {
      id: true,
      attendedOn: true,
      completedOn: true,
      signedOffOn: true,
      isCancelled: true,
      studentSession: {
        select: {
          student: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
      mentorSession: {
        select: {
          mentor: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
      chapter: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      attendedOn: "desc",
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}

function whereClause(
  term: Term,
  chapterId: number | undefined,
  termDate: string | undefined,
  mentorId: number | undefined,
  studentId: number | undefined,
  filterReports: string,
) {
  return {
    chapterId,
    studentSession: {
      studentId,
    },
    mentorSession: {
      mentorId,
    },
    completedOn:
      filterReports === "TO_SIGN_OFF"
        ? {
            not: null,
          }
        : filterReports === "OUTSTANDING"
          ? null
          : undefined,
    signedOffOn:
      filterReports === "TO_SIGN_OFF" || filterReports === "OUTSTANDING"
        ? null
        : undefined,
    attendedOn: termDate ?? {
      lte: term.end.isAfter(new Date()) ? new Date() : term.end.toDate(),
      gte: term.start.toDate(),
    },
    isCancelled:
      filterReports === "CANCELLED"
        ? true
        : filterReports === "TO_SIGN_OFF" || filterReports === "OUTSTANDING"
          ? false
          : undefined,
  };
}
