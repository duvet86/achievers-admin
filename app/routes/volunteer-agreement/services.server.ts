import type { MentorCommand } from "~/domain/aggregates/mentor/Mentor";

import { prisma } from "~/db.server";
import { UserRepository } from "~/infra/repositories/MentorRepository";

export interface UserData {
  firstName: string;
  lastName: string;
  mobile: string;
  addressStreet: string | undefined;
  addressSuburb: string | undefined;
  addressState: string | undefined;
  addressPostcode: string | undefined;
  dateOfBirth: Date | undefined;
  emergencyContactName: string | undefined;
  emergencyContactNumber: string | undefined;
  emergencyContactAddress: string | undefined;
  emergencyContactRelationship: string | undefined;
  hasApprovedToPublishPhotos: boolean | undefined;
  volunteerAgreementSignedOn: Date | undefined;
}

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.mentor.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
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
      hasApprovedToPublishPhotos: true,
      volunteerAgreementSignedOn: true,
      chapterId: true,
      frequencyInDays: true,
      additionalEmail: true,
      preferredName: true,
    },
  });
}

export async function confirmUserDetailsAsync(
  mentorId: number,
  data: MentorCommand,
) {
  const userRepository = new UserRepository();
  const mentor = await userRepository.findByIdAsync(mentorId);

  mentor.updateInfo(data);
  mentor.signVolunteerAgreement();

  await userRepository.saveAsync(mentor);
}
