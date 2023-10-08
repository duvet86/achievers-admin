import type { Chapter } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getMentorsWithStudentsAsync(chapterId: Chapter["id"]) {
  return prisma.user.findMany({
    where: {
      userAtChapter: {
        some: {
          chapterId,
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      frequencyInDays: true,
      mentorToStudentAssignement: {
        select: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              yearLevel: true,
            },
          },
        },
      },
    },
  });
}
