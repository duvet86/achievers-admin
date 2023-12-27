import dayjs from "dayjs";
import { prisma } from "~/db.server";

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

export async function getTotalMentorsAsync() {
  return await prisma.user.count({
    where: {
      endDate: null,
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

export async function getStudentsWithoutMentorAsync() {
  type CountResult = [{ count: number }];

  const countQuery = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT s.id) AS count
    FROM Student AS s
    LEFT JOIN MentorToStudentAssignement AS m ON s.id = m.studentId
    WHERE m.studentId IS NULL AND s.endDate IS NULL;`;

  return Number((countQuery as CountResult)[0].count);
}

export async function getTotalChaptersAsync() {
  return await prisma.chapter.count();
}

export async function getMentorsPerMonth() {
  const mentors = await prisma.user.findMany({
    select: {
      createdAt: true,
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
