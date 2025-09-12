import type { IMentorRepository } from "ddd/domain/aggregates/mentor/IMentorRepository";
import { Mentor } from "ddd/domain/aggregates/mentor/Mentor";
import { prisma } from "~/db.server";

export class UserRepository implements IMentorRepository {
  async findByIdAsync(id: number): Promise<Mentor> {
    const dbMentor = await prisma.mentor.findUniqueOrThrow({
      where: { id },
      select: {
        additionalEmail: true,
        addressPostcode: true,
        addressState: true,
        addressStreet: true,
        addressSuburb: true,
        chapterId: true,
        dateOfBirth: true,
        email: true,
        emergencyContactAddress: true,
        emergencyContactName: true,
        emergencyContactNumber: true,
        emergencyContactRelationship: true,
        endDate: true,
        endReason: true,
        firstName: true,
        fullName: true,
        hasApprovedToPublishPhotos: true,
        mobile: true,
        preferredName: true,
        profilePicturePath: true,
        volunteerAgreementSignedOn: true,
        azureADId: true,
        frequencyInDays: true,
        nextOfKinAddress: true,
        nextOfKinName: true,
        nextOfKinNumber: true,
        nextOfKinRelationship: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const mentor = Mentor.create(
      {
        additionalEmail: dbMentor.additionalEmail,
        addressPostcode: dbMentor.addressPostcode,
        addressState: dbMentor.addressState,
        addressStreet: dbMentor.addressStreet,
        addressSuburb: dbMentor.addressSuburb,
        chapterId: dbMentor.chapterId,
        dateOfBirth: dbMentor.dateOfBirth,
        email: dbMentor.email,
        emergencyContactAddress: dbMentor.emergencyContactAddress,
        emergencyContactName: dbMentor.emergencyContactName,
        emergencyContactNumber: dbMentor.emergencyContactNumber,
        emergencyContactRelationship: dbMentor.emergencyContactRelationship,
        endDate: dbMentor.endDate,
        endReason: dbMentor.endReason,
        firstName: dbMentor.firstName,
        fullName: dbMentor.fullName,
        hasApprovedToPublishPhotos: dbMentor.hasApprovedToPublishPhotos,
        mobile: dbMentor.mobile,
        preferredName: dbMentor.preferredName,
        profilePicturePath: dbMentor.profilePicturePath,
        volunteerAgreementSignedOn: dbMentor.volunteerAgreementSignedOn,
        azureADId: dbMentor.azureADId,
        frequencyInDays: dbMentor.frequencyInDays,
        nextOfKinAddress: dbMentor.nextOfKinAddress,
        nextOfKinName: dbMentor.nextOfKinName,
        nextOfKinNumber: dbMentor.nextOfKinNumber,
        nextOfKinRelationship: dbMentor.nextOfKinRelationship,
        lastName: dbMentor.lastName,
        createdAt: dbMentor.createdAt,
        updatedAt: dbMentor.updatedAt,
      },
      id,
    );

    return mentor;
  }

  async saveAsync(entity: Mentor): Promise<void> {
    await prisma.mentor.update({
      where: { id: entity.id },
      data: {
        additionalEmail: entity.additionalEmail,
        addressPostcode: entity.address.props.addressPostcode,
        addressState: entity.address.props.addressState,
        addressStreet: entity.address.props.addressStreet,
        addressSuburb: entity.address.props.addressSuburb,
        chapterId: entity.chapterId,
        dateOfBirth: entity.dateOfBirth,
        email: entity.email.props.value,
        emergencyContactAddress:
          entity.emergencyContact.props.emergencyContactAddress,
        emergencyContactName:
          entity.emergencyContact.props.emergencyContactName,
        emergencyContactNumber:
          entity.emergencyContact.props.emergencyContactNumber,
        emergencyContactRelationship:
          entity.emergencyContact.props.emergencyContactRelationship,
        endDate: entity.endDate,
        endReason: entity.endReason,
        firstName: entity.firstName,
        hasApprovedToPublishPhotos: entity.hasApprovedToPublishPhotos,
        mobile: entity.mobile,
        preferredName: entity.preferredName,
        profilePicturePath: entity.profilePicturePath,
        volunteerAgreementSignedOn: entity.volunteerAgreementSignedOn,
        azureADId: entity.azureADId,
        frequencyInDays: entity.frequencyInDays,
        nextOfKinAddress: entity.nextOfKin.props.nextOfKinAddress,
        nextOfKinName: entity.nextOfKin.props.nextOfKinName,
        nextOfKinNumber: entity.nextOfKin.props.nextOfKinNumber,
        nextOfKinRelationship: entity.nextOfKin.props.nextOfKinRelationship,
        lastName: entity.lastName,
      },
    });
  }
}
