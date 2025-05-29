import type { AppAbility } from "~/services/.server";
import type { Term } from "~/models";

import { prisma } from "~/db.server";
import { accessibleBy } from "~/casl-prisma";

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
  chapterId: number,
  studentId: number | undefined,
) {
  const chapterIdFilter = accessibleBy(ability).Chapter.id ?? chapterId;

  if (studentId) {
    return await prisma.$queryRaw<{ id: number; fullName: string }[]>`
      SELECT 
        u.id, u.fullName
      FROM SessionAttendance sa
      INNER JOIN MentorSession ms ON ms.id = sa.mentorSessionId
      INNER JOIN StudentSession ss ON ss.id = sa.studentSessionId
      INNER JOIN User u ON u.id = ms.mentorId
      WHERE sa.chapterId = ${chapterId} AND ss.studentId = ${studentId}
      GROUP BY u.id, u.fullName
      ORDER BY u.fullName ASC`;
  }

  return await prisma.$queryRaw<{ id: number; fullName: string }[]>`
    SELECT DISTINCT
      u.id, u.fullName
    FROM User u
    INNER JOIN MentorToStudentAssignement msa ON msa.userId = u.id
    WHERE u.chapterId = ${chapterIdFilter}
    ORDER BY u.fullName ASC`;
}

export async function getAvailabelStudentsAsync(
  ability: AppAbility,
  chapterId: number,
  mentorId: number | undefined,
) {
  const chapterIdFilter = accessibleBy(ability).Chapter.id ?? chapterId;

  if (mentorId) {
    return await prisma.$queryRaw<{ id: number; fullName: string }[]>`
      SELECT 
        s.id, s.fullName
      FROM SessionAttendance sa
      INNER JOIN MentorSession ms ON ms.id = sa.mentorSessionId
      INNER JOIN StudentSession ss ON ss.id = sa.studentSessionId
      INNER JOIN Student s ON s.id = ss.studentId
      WHERE sa.chapterId = ${chapterId} AND ms.mentorId = ${mentorId}
      GROUP BY s.id, s.fullName
      ORDER BY s.fullName ASC`;
  }

  return await prisma.$queryRaw<{ id: number; fullName: string }[]>`
    SELECT DISTINCT
      s.id, s.fullName
    FROM Student s
    INNER JOIN MentorToStudentAssignement msa ON msa.studentId = s.id
    WHERE s.chapterId = ${chapterIdFilter}
    ORDER BY s.fullName ASC`;
}

export async function getCountAsync(
  chapterId: number,
  term: Term,
  termDate: string | undefined,
  mentorId: number | undefined,
  studentId: number | undefined,
  filterReports: string,
) {
  return await prisma.sessionAttendance.count({
    where: whereClause(
      chapterId,
      term,
      termDate,
      mentorId,
      studentId,
      filterReports,
    ),
  });
}

export async function getSessionsAsync(
  chapterId: number,
  term: Term,
  termDate: string | undefined,
  mentorId: number | undefined,
  studentId: number | undefined,
  filterReports: string,
  pageNumber: number,
  numberItems = 10,
) {
  return await prisma.sessionAttendance.findMany({
    where: whereClause(
      chapterId,
      term,
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
    },
    orderBy: {
      attendedOn: "desc",
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}

function whereClause(
  chapterId: number,
  term: Term,
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
      lte: term.end.toDate(),
      gte: term.start.toDate(),
    },
  };
}
