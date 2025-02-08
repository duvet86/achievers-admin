import type { AppAbility } from "~/services/.server";

import { accessibleBy } from "@casl/prisma";

import { prisma } from "~/db.server";

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
  return await prisma.user.findMany({
    where: {
      chapter: accessibleBy(ability).Chapter,
      chapterId,
      mentorToStudentAssignement: {
        some: {
          studentId,
        },
      },
    },
    select: {
      id: true,
      fullName: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });
}

export async function getAvailabelStudentsAsync(
  ability: AppAbility,
  chapterId: number,
  mentorId: number | undefined,
) {
  return await prisma.student.findMany({
    where: {
      chapter: accessibleBy(ability).Chapter,
      chapterId,
      mentorToStudentAssignement: {
        some: {
          userId: mentorId,
        },
      },
    },
    select: {
      id: true,
      fullName: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });
}

export async function getCountAsync(
  chapterId: number,
  mentorId: number | undefined,
  studentId: number | undefined,
) {
  return await prisma.goal.count({
    where: { chapterId, mentorId, studentId },
  });
}

export async function getStudentGoalsAsync(
  chapterId: number,
  mentorId: number | undefined,
  studentId: number | undefined,
  pageNumber: number,
  numberItems = 10,
) {
  return await prisma.goal.findMany({
    where: {
      chapterId,
      mentorId,
      studentId,
    },
    select: {
      id: true,
      title: true,
      isAchieved: true,
      endDate: true,
      chapter: {
        select: {
          id: true,
          name: true,
        },
      },
      mentor: {
        select: {
          id: true,
          fullName: true,
        },
      },
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}
