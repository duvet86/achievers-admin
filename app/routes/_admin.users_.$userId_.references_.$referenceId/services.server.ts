import dayjs from "dayjs";
import { prisma } from "~/db.server";

export interface ReferenceUpdateCommand {
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  bestTimeToContact: string | undefined;
  relationship: string;
  outcomeComment: string;
  hasKnowApplicantForAYear: boolean;
  isRelated: boolean;
  knownForComment: string | undefined;
  safeWithChildren: string | undefined;
  skillAndKnowledgeComment: string | undefined;
  empathyAndPatienceComment: string | undefined;
  buildRelationshipsComment: string | undefined;
  isMentorRecommended: boolean;
  calledBy: string;
  calledOndate: Date | string;
  generalComment?: string | null;
}

export async function getUserWithReferenceByIdAsync(
  userId: number,
  referenceId: number,
) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select: {
      firstName: true,
      lastName: true,
      references: {
        where: {
          id: referenceId,
        },
      },
    },
  });
}

export async function updateReferenceByIdAsync(
  userId: number,
  referenceId: number,
  data: ReferenceUpdateCommand,
) {
  return await prisma.reference.upsert({
    where: {
      id: referenceId,
    },
    create: {
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      mobile: data.mobile,
      email: data.email,
      bestTimeToContact: data.bestTimeToContact,
      relationship: data.relationship,
      hasKnowApplicantForAYear: data.hasKnowApplicantForAYear,
      isRelated: data.isRelated,
      knownForComment: data.knownForComment,
      safeWithChildren: data.safeWithChildren,
      skillAndKnowledgeComment: data.skillAndKnowledgeComment,
      empathyAndPatienceComment: data.empathyAndPatienceComment,
      buildRelationshipsComment: data.buildRelationshipsComment,
      outcomeComment: data.outcomeComment,
      generalComment: data.generalComment,
      isMentorRecommended: data.isMentorRecommended,
      calledBy: data.calledBy,
      calledOndate: dayjs(data.calledOndate, "YYYY-MM-DD").toDate(),
    },
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      mobile: data.mobile,
      email: data.email,
      bestTimeToContact: data.bestTimeToContact,
      relationship: data.relationship,
      hasKnowApplicantForAYear: data.hasKnowApplicantForAYear,
      isRelated: data.isRelated,
      knownForComment: data.knownForComment,
      safeWithChildren: data.safeWithChildren,
      skillAndKnowledgeComment: data.skillAndKnowledgeComment,
      empathyAndPatienceComment: data.empathyAndPatienceComment,
      buildRelationshipsComment: data.buildRelationshipsComment,
      outcomeComment: data.outcomeComment,
      generalComment: data.generalComment,
      isMentorRecommended: data.isMentorRecommended,
      calledBy: data.calledBy,
      calledOndate: dayjs(data.calledOndate, "YYYY-MM-DD").toDate(),
    },
  });
}
