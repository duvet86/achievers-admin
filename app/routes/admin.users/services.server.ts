import dayjs from "dayjs";

import { prisma } from "~/db.server";
import { searchAcrossFields } from "~/services/.server";

export async function getChaptersAsync() {
  return await prisma.chapter.findMany({
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getUsersCountAsync(
  searchTerm: string | null,
  chapterId: number | null,
  onlyExpiredChecks = false,
  includeArchived = false,
) {
  return await prisma.user.count({
    where: {
      AND: [
        includeArchived ? {} : { endDate: null },
        chapterId !== null
          ? {
              chapterId: chapterId,
            }
          : {},
        {
          OR: getOR(searchTerm, onlyExpiredChecks),
        },
      ],
    },
  });
}

export async function getUsersAsync(
  pageNumber: number,
  searchTerm: string | null,
  chapterId: number | null,
  onlyExpiredChecks = false,
  includeArchived = false,
  numberItems = 10,
) {
  return await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      volunteerAgreementSignedOn: true,
      endDate: true,
      chapter: {
        select: {
          name: true,
        },
      },
      approvalbyMRC: {
        select: {
          submittedDate: true,
        },
      },
      induction: {
        select: {
          completedOnDate: true,
        },
      },
      policeCheck: {
        select: {
          createdAt: true,
          expiryDate: true,
          reminderSentAt: true,
        },
      },
      references: {
        select: {
          calledOndate: true,
        },
      },
      welcomeCall: {
        select: {
          calledOnDate: true,
        },
      },
      wwcCheck: {
        select: {
          createdAt: true,
          expiryDate: true,
          reminderSentAt: true,
        },
      },
    },
    where: {
      AND: [
        includeArchived ? {} : { endDate: null },
        chapterId !== null
          ? {
              chapterId: chapterId,
            }
          : {},
        {
          OR: getOR(searchTerm, onlyExpiredChecks),
        },
      ],
    },
    orderBy: {
      firstName: "asc",
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}

interface UserChecks {
  welcomeCall: unknown;
  references: {
    calledOndate: Date | null;
  }[];
  induction: unknown;
  policeCheck: unknown;
  wwcCheck: unknown;
  approvalbyMRC: unknown;
  volunteerAgreementSignedOn: unknown;
}

export function getNumberCompletedChecks(user: UserChecks): number {
  let checks = 1;
  if (user.welcomeCall !== null) {
    checks++;
  }
  if (user.references.filter((ref) => ref.calledOndate !== null).length >= 2) {
    checks++;
  }
  if (user.induction !== null) {
    checks++;
  }
  if (user.policeCheck !== null) {
    checks++;
  }
  if (user.wwcCheck !== null) {
    checks++;
  }
  if (user.approvalbyMRC !== null) {
    checks++;
  }
  if (user.volunteerAgreementSignedOn !== null) {
    checks++;
  }

  return checks;
}

function getOR(searchTerm: string | null, onlyExpiredChecks: boolean) {
  const or = [];

  if (searchTerm !== null) {
    or.push(
      ...(searchAcrossFields(
        searchTerm,
        (term) =>
          [
            { firstName: { contains: term } },
            { lastName: { contains: term } },
            { email: { contains: term } },
          ] as const,
      ) as []),
    );
  }
  if (onlyExpiredChecks) {
    or.push(
      {
        policeCheck: {
          expiryDate: {
            lte: dayjs().add(3, "months").toDate(),
          },
        },
      },
      {
        wwcCheck: {
          expiryDate: {
            lte: dayjs().add(3, "months").toDate(),
          },
        },
      },
    );
  }

  return or.length > 0 ? or : undefined;
}
