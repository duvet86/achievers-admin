import { PrismaClient } from "@prisma/client";

export async function createUserAsync() {
  const prisma = new PrismaClient();
  await prisma.$connect();

  await prisma.$transaction([
    prisma.approvalbyMRC.deleteMany(),
    prisma.eoIProfile.deleteMany(),
    prisma.induction.deleteMany(),
    prisma.policeCheck.deleteMany(),
    prisma.reference.deleteMany(),
    prisma.volunteerAgreement.deleteMany(),
    prisma.welcomeCall.deleteMany(),
    prisma.wWCCheck.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  await prisma.user.create({
    data: {
      azureADId: null,
      email: "test@test.com",
      firstName: "test",
      lastName: "user",
      mobile: "123",
      addressStreet: "street",
      addressSuburb: "suburb",
      addressState: "state",
      addressPostcode: "123123",
      additionalEmail: null,
      dateOfBirth: null,
      emergencyContactName: null,
      emergencyContactNumber: null,
      emergencyContactAddress: null,
      emergencyContactRelationship: null,
      nextOfKinName: null,
      nextOfKinNumber: null,
      nextOfKinAddress: null,
      nextOfKinRelationship: null,
      profilePicturePath: null,
      hasApprovedToPublishPhotos: null,
      endDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      eoIProfile: {
        create: {
          bestTimeToContact: "",
          occupation: "",
          volunteerExperience: "",
          role: "",
          mentoringLevel: "",
          heardAboutUs: "",
          preferredFrequency: "",
          isOver18: true,
          comment: "",
          aboutMe: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      welcomeCall: {
        create: {
          calledBy: "",
          calledOnDate: new Date(),
          comment: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      references: {
        createMany: {
          data: [
            {
              firstName: "",
              lastName: "",
              mobile: "",
              email: "",
              bestTimeToContact: "",
              relationship: "",
              generalComment: null,
              outcomeComment: null,
              hasKnowApplicantForAYear: null,
              isRelated: null,
              isMentorRecommended: null,
              calledBy: null,
              calledOndate: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              firstName: "",
              lastName: "",
              mobile: "",
              email: "",
              bestTimeToContact: "",
              relationship: "",
              generalComment: null,
              outcomeComment: null,
              hasKnowApplicantForAYear: null,
              isRelated: null,
              isMentorRecommended: null,
              calledBy: null,
              calledOndate: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
      },
      induction: {
        create: {
          runBy: "",
          completedOnDate: new Date(),
          comment: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      volunteerAgreement: {
        create: {
          isInformedOfConstitution: true,
          hasApprovedSafetyDirections: true,
          hasAcceptedNoLegalResp: true,
          signedOn: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      policeCheck: {
        create: {
          filePath: "",
          expiryDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      wwcCheck: {
        create: {
          wwcNumber: "",
          filePath: "",
          expiryDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      approvalbyMRC: {
        create: {
          completedBy: "",
          submittedDate: null,
          comment: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      userAtChapter: {
        create: {
          assignedBy: "test-data",
          chapterId: (await prisma.chapter.findFirstOrThrow()).id,
        },
      },
    },
  });
}
