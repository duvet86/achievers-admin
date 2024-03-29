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
          OR: searchAcrossFields(
            searchTerm,
            (x) =>
              [
                { firstName: { contains: x } },
                { lastName: { contains: x } },
                { email: { contains: x } },
              ] as const,
          ),
        },
      ],
    },
  });
}

export async function getUsersAsync(
  pageNumber: number,
  searchTerm: string | null,
  chapterId: number | null,
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
          OR: searchAcrossFields(
            searchTerm,
            (x) =>
              [
                { firstName: { contains: x } },
                { lastName: { contains: x } },
                { email: { contains: x } },
              ] as const,
          ),
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
