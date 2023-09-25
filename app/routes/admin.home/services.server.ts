import { prisma } from "~/db.server";

export async function getTotalMentorsAsync() {
  return await prisma.user.count();
}

export async function getIncompleteMentorsAsync() {
  return await prisma.user.count({
    where: {
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
  return await prisma.student.count();
}

export async function getTotalChaptersAsync() {
  return await prisma.chapter.count();
}
