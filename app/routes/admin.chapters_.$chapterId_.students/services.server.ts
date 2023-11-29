import type { Chapter } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getMentorsWithStudentsAsync(chapterId: Chapter["id"]) {
  return prisma.student.findMany({
    where: {
      studentAtChapter: {
        some: {
          chapterId,
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      mentorToStudentAssignement: {
        select: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              frequencyInDays: true,
            },
          },
        },
      },
    },
  });
}
