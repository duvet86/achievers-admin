import { prisma } from "~/db.server";

export async function getPartnersAync(azureADId: string) {
  const mentor = await prisma.mentor.findUniqueOrThrow({
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
      mentorId: mentor.id,
    },
    select: {
      studentId: true,
    },
  });

  const partners = await prisma.mentorToStudentAssignement.findMany({
    distinct: "mentorId",
    where: {
      studentId: {
        in: studentAssignements.map(({ studentId }) => studentId),
      },
    },
    select: {
      mentor: {
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
    .filter(({ mentor: { id } }) => mentor.id !== id)
    .map((partner) => {
      const isSharingWithMentor =
        mentorShareToLookup[partner.mentor.id.toString()];
      const isInfoShared =
        sharingMentorInfoWithLookup[partner.mentor.id.toString()];

      return {
        ...partner.mentor,
        isInfoShared,
        email: isSharingWithMentor ? partner.mentor.email : null,
        mobile: isSharingWithMentor ? partner.mentor.mobile : null,
      };
    });
}

export async function shareInfoWithPartner(
  mentorAzureId: string,
  mentorSharedToId: number,
) {
  const mentor = await prisma.mentor.findUniqueOrThrow({
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
  const mentor = await prisma.mentor.findUniqueOrThrow({
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
