import { prisma } from "~/db.server";

export async function getPartnersAync(azureADId: string) {
  const mentor = await prisma.user.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      id: true,
      mentorSharedTo: {
        select: {
          mentorSharingId: true,
          mentorSharedToId: true,
        },
      },
      mentorSharing: {
        select: {
          mentorSharingId: true,
          mentorSharedToId: true,
        },
      },
    },
  });

  const mentorShareToLookup = mentor.mentorSharedTo.reduce<
    Record<string, boolean>
  >((res, { mentorSharingId }) => {
    res[mentorSharingId.toString()] = true;
    return res;
  }, {});

  const sharingMentorInfoWithLookup = mentor.mentorSharing.reduce<
    Record<string, boolean>
  >((res, { mentorSharedToId }) => {
    res[mentorSharedToId.toString()] = true;
    return res;
  }, {});

  const studentAssignements = await prisma.mentorToStudentAssignement.findMany({
    where: {
      userId: mentor.id,
    },
    select: {
      studentId: true,
    },
  });

  const partners = await prisma.mentorToStudentAssignement.findMany({
    distinct: "userId",
    where: {
      studentId: {
        in: studentAssignements.map(({ studentId }) => studentId),
      },
    },
    select: {
      user: {
        select: {
          id: true,
          fullName: true,
          mobile: true,
          email: true,
        },
      },
    },
  });

  return partners
    .filter(({ user: { id } }) => mentor.id !== id)
    .map((partner) => {
      const isSharingWithMentor =
        mentorShareToLookup[partner.user.id.toString()];
      const isInfoShared =
        sharingMentorInfoWithLookup[partner.user.id.toString()];

      return {
        ...partner.user,
        isInfoShared,
        email: isSharingWithMentor ? partner.user.email : null,
        mobile: isSharingWithMentor ? partner.user.mobile : null,
      };
    });
}

export async function shareInfoWithPartner(
  mentorAzureId: string,
  mentorSharedToId: number,
) {
  const mentor = await prisma.user.findUniqueOrThrow({
    where: {
      azureADId: mentorAzureId,
    },
    select: {
      id: true,
    },
  });

  return await prisma.mentorShareInfo.create({
    data: {
      mentorSharingId: mentor.id,
      mentorSharedToId,
    },
  });
}

export async function removeShareInfo(
  mentorAzureId: string,
  mentorSharedToId: number,
) {
  const mentor = await prisma.user.findUniqueOrThrow({
    where: {
      azureADId: mentorAzureId,
    },
    select: {
      id: true,
    },
  });

  return await prisma.mentorShareInfo.delete({
    where: {
      mentorSharingId_mentorSharedToId: {
        mentorSharingId: mentor.id,
        mentorSharedToId,
      },
    },
  });
}
