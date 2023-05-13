import { PrismaClient } from "@prisma/client";

export async function createUserAsync() {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();

    await prisma.$transaction([
      prisma.approvalbyMRC.deleteMany(),
      prisma.eoIProfile.deleteMany(),
      prisma.induction.deleteMany(),
      prisma.policeCheck.deleteMany(),
      prisma.reference.deleteMany(),
      prisma.welcomeCall.deleteMany(),
      prisma.wWCCheck.deleteMany(),
      prisma.userAtChapter.deleteMany(),
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
        volunteerAgreementSignedOn: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        eoIProfile: {
          create: {
            bestTimeToContact: "Afternoon after 3pm",
            occupation: "Retired",
            volunteerExperience: "None",
            role: "Mentor",
            mentoringLevel: "2 years at Curtin university",
            preferredFrequency: "every week",
            heardAboutUs: "Linkid",
            isOver18: true,
            comment: "I am ready to rock",
            aboutMe:
              "I have a lot of energy and I want to share it with everyone",
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
                email: "aaa@aaa.com",
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
                email: "bbb@bbb.com",
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
  } catch {
  } finally {
    await prisma.$disconnect();
  }
}
