import { prisma } from "~/db.server";

export async function getMentorsWithStudentsCountAsync(
  chapterId: number,
  searchTerm: string | null,
) {
  return prisma.student.count({
    where: {
      chapterId,
      OR: [
        {
          fullName: {
            contains: searchTerm ?? undefined,
          },
        },
      ],
    },
  });
}

export async function getMentorsWithStudentsAsync(
  chapterId: number,
  searchTerm: string | null,
  pageNumber: number,
  numberItems = 10,
) {
  return prisma.student.findMany({
    where: {
      chapterId,
      OR: [
        {
          fullName: {
            contains: searchTerm ?? undefined,
          },
        },
      ],
    },
    select: {
      id: true,
      fullName: true,
      mentorToStudentAssignement: {
        select: {
          user: {
            select: {
              id: true,
              fullName: true,
              frequencyInDays: true,
            },
          },
        },
      },
    },
    orderBy: {
      mentorToStudentAssignement: {
        _count: "desc",
      },
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}
