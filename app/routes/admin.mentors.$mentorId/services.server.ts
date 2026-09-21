import { Gender } from "~/prisma/client";
import { prisma } from "~/db.server";

export interface MentorCommand {
  firstName: string;
  lastName: string;
  preferredName: string | null;
  note: string | null;
  mobile: string;
  addressStreet: string;
  addressSuburb: string;
  addressState: string;
  addressPostcode: string;
  additionalEmail: string | null;
  dateOfBirth: Date | null;
  frequencyInDays: number | null;
  emergencyContactName: string | null;
  emergencyContactNumber: string | null;
  emergencyContactAddress: string | null;
  emergencyContactRelationship: string | null;
  hasApprovedToPublishPhotos: boolean | null;
  chapterId: number;
  gender: Gender | null;
}

export async function getChaptersAsync() {
  return await prisma.chapter.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      order: "asc",
    },
  });
}

export async function getUserByIdAsync(id: number) {
  return await prisma.volunteer.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      azureADId: true,
      fullName: true,
      firstName: true,
      lastName: true,
      preferredName: true,
      note: true,
      email: true,
      mobile: true,
      addressStreet: true,
      addressSuburb: true,
      addressState: true,
      addressPostcode: true,
      dateOfBirth: true,
      emergencyContactName: true,
      emergencyContactNumber: true,
      emergencyContactAddress: true,
      emergencyContactRelationship: true,
      additionalEmail: true,
      profilePicturePath: true,
      volunteerAgreementSignedOn: true,
      hasApprovedToPublishPhotos: true,
      endDate: true,
      chapterId: true,
      frequencyInDays: true,
      gender: true,
      chapter: {
        select: {
          id: true,
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
        },
        // Only the current check (the one that expires last) matters here.
        orderBy: [{ expiryDate: "desc" }, { id: "desc" }],
        take: 1,
      },
    },
  });
}

export async function updateMentorByIdAsync(
  mentorId: number,
  dataUpdate: MentorCommand,
  email?: string,
) {
  await prisma.volunteer.update({
    where: {
      id: mentorId,
    },
    data: {
      email: email ?? undefined,
      ...dataUpdate,
    },
  });
}

export async function removeWelcomeCall(mentorId: number) {
  return await prisma.welcomeCall.delete({
    where: {
      volunteerId: mentorId,
    },
  });
}

export async function removeInduction(mentorId: number) {
  return await prisma.induction.delete({
    where: {
      volunteerId: mentorId,
    },
  });
}

export async function removePoliceCheck(mentorId: number) {
  return await prisma.policeCheck.delete({
    where: {
      volunteerId: mentorId,
    },
  });
}

export async function removeWwccheck(mentorId: number) {
  return await prisma.wWCCheck.deleteMany({
    where: {
      volunteerId: mentorId,
    },
  });
}

export async function removeApprovalMrc(mentorId: number) {
  return await prisma.approvalbyMRC.delete({
    where: {
      volunteerId: mentorId,
    },
  });
}

export function parseGender(value: string | undefined | null): Gender | null {
  if (!value) {
    return null;
  }

  switch (value) {
    case "MALE":
      return Gender.MALE;
    case "FEMALE":
      return Gender.FEMALE;
    case "OTHER":
      return Gender.OTHER;
    default:
      return Gender.PREFER_NOT_TO_SAY;
  }
}
