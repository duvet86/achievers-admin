import { prisma } from "~/db.server";

export async function getTotalMentorsAsync() {
  return await prisma.user.count({
    where: {
      endDate: null,
    },
  });
}

export async function getMentorsWithoutChapterAsync() {
  return await prisma.user.count({
    where: {
      endDate: null,
      userAtChapter: {
        none: {},
      },
    },
  });
}

export async function getIncompleteMentorsAsync() {
  return await prisma.user.count({
    where: {
      endDate: null,
      OR: [
        {
          welcomeCall: {
            is: null,
          },
        },
        {
          references: {
            some: {
              calledOndate: {
                equals: null,
              },
            },
          },
        },
        {
          induction: {
            is: null,
          },
        },
        {
          policeCheck: {
            is: null,
          },
        },
        {
          wwcCheck: {
            is: null,
          },
        },
        {
          approvalbyMRC: {
            is: null,
          },
        },
      ],
    },
  });
}

export async function getTotalStudentsAsync() {
  return await prisma.student.count({
    where: {
      endDate: null,
    },
  });
}

export async function getStudentsWithoutChapterAsync() {
  return await prisma.student.count({
    where: {
      endDate: null,
      studentAtChapter: {
        none: {},
      },
    },
  });
}

export async function getTotalChaptersAsync() {
  return await prisma.chapter.count();
}
