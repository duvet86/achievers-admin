import type { Prisma } from "~/prisma/client";
import type { AppAbility } from "~/services/.server";

import { prisma } from "~/db.server";
import { accessibleBy } from "~/casl-prisma";

export interface UserQuery {
  id: number;
  fullName: string;
  volunteerAgreementSignedOn: string | null;
  endDate: string | null;
  mobile: string;
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
) {
  const count = await prisma.$queryRawUnsafe<{ count: number }[]>(
    `SELECT count(*) count FROM (${getUserQuery(ability, searchTerm, chapterId, onlyExpiredChecks, includeArchived)}) s`,
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
  sortChecksCompletedSubmit: Prisma.SortOrder,
  onlyExpiredChecks = false,
  includeArchived = false,
  numberItems = 10,
) {
  let orderBy = "";
  if (sortFullName) {
    orderBy = `fullName ${sortFullName}`;
  }
  if (sortChapter) {
    orderBy = `chapterName ${sortChapter}`;
  }
  if (sortChecksCompletedSubmit) {
    orderBy = `checksCompleted ${sortChecksCompletedSubmit}`;
  }

  const query = `
    ${getUserQuery(ability, searchTerm, chapterId, onlyExpiredChecks, includeArchived)}
    ORDER BY ${orderBy}
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
) {
  let chapterWhereClause = "1 = ?";
  if (accessibleBy(ability).Chapter.id || chapterId !== null) {
    chapterWhereClause = `chapterId = ?`;
  }
  let searchTermWhereClause = "1 = ?";
  if (searchTerm !== null) {
    searchTermWhereClause = `fullName LIKE ?`;
  }
  let archivedWhereClause = "endDate IS NULL";
  if (includeArchived) {
    archivedWhereClause = "1 = 1";
  }
  let expiredChecksWhereClause = "1 = 1";
  if (onlyExpiredChecks) {
    expiredChecksWhereClause = `(policeCheckExpiryDate <= DATE_ADD(NOW(), INTERVAL 3 MONTH) OR  wwccheckExpiryDate <= DATE_ADD(NOW(), INTERVAL 3 MONTH))`;
  }

  return `
    SELECT 
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
          u.mobile,
          c.name chapterName,
          pc.expiryDate policeCheckExpiryDate,
          pc.reminderSentAt policeCheckReminderSentAt,
          wcc.expiryDate wwccheckExpiryDate,
          wcc.reminderSentAt wwccheckReminderSent,
          (SELECT COUNT(r.mentorId) FROM Reference r WHERE r.mentorId = u.id GROUP BY r.mentorId) as count,
          ap.id approvalbymrcId,
          p.id eoiprofileId,
          pc.id policecheckId,
          wcc.id wwccheckId,
          wc.id welcomecallId,
          i.id inductionId,
          c.id chapterId
        FROM Mentor u
        INNER JOIN Chapter c ON c.id = u.chapterId
        LEFT JOIN ApprovalbyMRC ap ON ap.mentorId = u.id
        LEFT JOIN EoIProfile p ON p.mentorId = u.id
        LEFT JOIN PoliceCheck pc ON pc.mentorId = u.id
        LEFT JOIN WWCCheck wcc ON wcc.mentorId = u.id
        LEFT JOIN WelcomeCall wc ON wc.mentorId = u.id
        LEFT JOIN Induction i ON i.mentorId = u.id
    ) as s
    WHERE
      ${chapterWhereClause}
      AND ${archivedWhereClause}
      AND ${searchTermWhereClause}
      AND ${expiredChecksWhereClause}`;
}
