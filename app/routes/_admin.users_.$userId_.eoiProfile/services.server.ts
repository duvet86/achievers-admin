import { prisma } from "~/db.server";

export interface EoiUpdateCommand {
  bestTimeToContact: string;
  occupation: string;
  volunteerExperience: string;
  role: string;
  mentoringLevel: string;
  heardAboutUs: string;
  preferredFrequency: string;
  isOver18: boolean;
  comment: string;
  aboutMe: string;
}

export async function getUserByIdAsync(id: number) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      firstName: true,
      lastName: true,
      eoIProfile: true,
    },
  });
}

export async function updateEoiByUserIdAsync(
  userId: number,
  data: EoiUpdateCommand,
) {
  return await prisma.eoIProfile.upsert({
    where: {
      userId: userId,
    },
    create: {
      userId,
      ...data,
    },
    update: {
      ...data,
    },
  });
}
