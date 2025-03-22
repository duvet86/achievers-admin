import type { Prisma } from "@prisma/client/index.js";
import type { AppAbility } from "~/services/.server";

import { accessibleBy } from "@casl/prisma";

import { prisma } from "~/db.server";

export interface UserQuery {
  id: number;
  fullName: string;
  volunteerAgreementSignedOn: string | null;
  endDate: string | null;
  chapterName: string;
  policeCheckExpiryDate: string | null;
  policeCheckReminderSentAt: string | null;
  wwccheckExpiryDate: string | null;
  wwccheckReminderSentAt: string | null;
  checksCompleted: number;
}

export async function getChaptersAsync(ability: AppAbility) {
  return await prisma.chapter.findMany({
    where: accessibleBy(ability).Chapter,
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getUsersCountAsync(
  ability: AppAbility,
  searchTerm: string | null,
  chapterId: number | null,
  onlyExpiredChecks = false,
  includeArchived = false,
  includeCompleteChecks = false,
) {
  const count = await prisma.$queryRawUnsafe<{ count: number }[]>(
    `SELECT count(*) count FROM (${getUserQuery(ability, searchTerm, chapterId, onlyExpiredChecks, includeArchived, includeCompleteChecks)}) s`,
    accessibleBy(ability).Chapter.id ?? chapterId ?? "1",
    searchTerm ? `%${searchTerm}%` : "1",
  );

  return Number(count[0].count);
}

export async function getUsersAsync(
  ability: AppAbility,
  pageNumber: number,
  searchTerm: string | null,
  chapterId: number | null,
  sortFullName: Prisma.SortOrder,
  sortChapter: Prisma.SortOrder,
  onlyExpiredChecks = false,
  includeArchived = false,
  includeCompleteChecks = false,
  numberItems = 10,
) {
  const query = `
  ${getUserQuery(ability, searchTerm, chapterId, onlyExpiredChecks, includeArchived, includeCompleteChecks)}
  ORDER BY
    ${sortChapter ? "" : `fullName ${sortFullName ?? "asc"}`}
    ${sortChapter ? `chapterName ${sortChapter}` : ""}
  LIMIT ${numberItems}
  OFFSET ${numberItems * pageNumber}`;

  return await prisma.$queryRawUnsafe<UserQuery[]>(
    query,
    accessibleBy(ability).Chapter.id ?? chapterId ?? "1",
    searchTerm ? `%${searchTerm}%` : "1",
  );
}

export function getUserQuery(
  ability: AppAbility,
  searchTerm: string | null,
  chapterId: number | null,
  onlyExpiredChecks: boolean,
  includeArchived: boolean,
  includeCompleteChecks: boolean,
) {
  let chapterWhereClause = "1 = ?";
  if (accessibleBy(ability).Chapter.id || chapterId !== null) {
    chapterWhereClause = `chapterId = ?`;
  }
  let searchTermWhereClause = "1 = ?";
  if (searchTerm !== null) {
    searchTermWhereClause = `(fullName LIKE ? OR email LIKE ?)`;
  }
  let archivedWhereClause = "endDate IS NULL";
  if (includeArchived) {
    archivedWhereClause = "endDate IS NOT NULL";
  }
  let expiredChecksWhereClause = "1 = 1";
  if (onlyExpiredChecks) {
    expiredChecksWhereClause = `(pc.expiryDate <= DATE_ADD(NOW(), INTERVAL 3 MONTH) OR  wcc.expiryDate <= DATE_ADD(NOW(), INTERVAL 3 MONTH))`;
  }
  let includeCompleteChecksWhereClause = `(approvalbymrcId IS NULL 
  OR eoiprofileId IS NULL
  OR policecheckId IS NULL
  OR wwccheckId IS NULL
  OR welcomecallId IS NULL
  OR inductionId IS NULL
  OR volunteerAgreementSignedOn IS NULL
  OR count < 2)`;
  if (includeCompleteChecks) {
    includeCompleteChecksWhereClause = "1 = 1";
  }

  return `SELECT 
    *,
    (IF(approvalbymrcId IS NULL, 0, 1) +
      IF(eoiprofileId IS NULL, 0, 1) +
      IF(policecheckId IS NULL, 0, 1) +
      IF(wwccheckId IS NULL, 0, 1) +
      IF(welcomecallId IS NULL, 0, 1) +
      IF(inductionId IS NULL, 0, 1) +
      IF(volunteerAgreementSignedOn IS NULL, 0, 1) +
      IF(count < 2, 0, 1)) checksCompleted
  FROM
  (
    SELECT
        u.id,
        u.fullName,
        u.email,
        u.volunteerAgreementSignedOn,
        u.endDate,
        c.name chapterName,
        pc.expiryDate policeCheckExpiryDate,
        pc.reminderSentAt policeCheckReminderSentAt,
        wcc.expiryDate wwccheckExpiryDate,
        wcc.reminderSentAt wwccheckReminderSent,
        (SELECT COUNT(r.userId) FROM achievers.reference r WHERE r.userId = u.id GROUP BY r.userId) as count,
        ap.id approvalbymrcId,
        p.id eoiprofileId,
        pc.id policecheckId,
        wcc.id wwccheckId,
        wc.id welcomecallId,
        i.id inductionId,
        c.id chapterId
      FROM achievers.user u
      INNER JOIN achievers.chapter c ON c.id = u.chapterId
      LEFT JOIN achievers.approvalbymrc ap ON ap.userId = u.id
      LEFT JOIN achievers.eoiprofile p ON p.userId = u.id
      LEFT JOIN achievers.policecheck pc ON pc.userId = u.id
      LEFT JOIN achievers.wwccheck wcc ON wcc.userId = u.id
      LEFT JOIN achievers.welcomecall wc ON wc.userId = u.id
      LEFT JOIN achievers.induction i ON i.userId = u.id
  ) as s
  WHERE
    ${chapterWhereClause}
    AND ${archivedWhereClause}
    AND ${searchTermWhereClause}
    AND ${expiredChecksWhereClause}
    AND ${includeCompleteChecksWhereClause}`;
}
