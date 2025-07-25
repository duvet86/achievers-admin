import { prisma } from "~/db.server";

export interface EoiUpdateCommand {
  bestTimeToContact: string;
  occupation: string;
  volunteerExperience: string;
  role: string;
  mentoringLevel: string;
  heardAboutUs: string;
  preferredFrequency: string;
  preferredSubject: string;
  isOver18: boolean;
  comment: string;
  aboutMe: string | null;
  linkedInProfile: string | null;
  wasMentor: string;
}

export async function getUserByIdAsync(id: number) {
  return await prisma.mentor.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
      eoIProfile: true,
    },
  });
}

export async function updateEoiByUserIdAsync(
  mentorId: number,
  data: EoiUpdateCommand,
) {
  return await prisma.eoIProfile.upsert({
    where: {
      mentorId,
    },
    create: {
      mentorId,
      ...data,
    },
    update: {
      ...data,
    },
  });
}
