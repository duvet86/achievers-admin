import { prisma } from "~/db.server";

export interface ReferenceUpdateCommand {
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  bestTimeToContact: string;
  relationship: string;
  outcomeComment: string;
  hasKnowApplicantForAYear: boolean;
  isRelated: boolean;
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
      bestTimeToContact: data.bestTimeToContact,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      mobile: data.mobile,
      relationship: data.relationship,
      calledBy: data.calledBy,
      calledOndate: data.calledOndate,
      generalComment: data.generalComment,
      hasKnowApplicantForAYear: data.hasKnowApplicantForAYear,
      isMentorRecommended: data.isMentorRecommended,
      isRelated: data.isRelated,
      outcomeComment: data.outcomeComment,
      userId,
    },
    update: {
      bestTimeToContact: data.bestTimeToContact,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      mobile: data.mobile,
      relationship: data.relationship,
      calledBy: data.calledBy,
      calledOndate: data.calledOndate,
      generalComment: data.generalComment,
      hasKnowApplicantForAYear: data.hasKnowApplicantForAYear,
      isMentorRecommended: data.isMentorRecommended,
      isRelated: data.isRelated,
      outcomeComment: data.outcomeComment,
    },
  });
}
