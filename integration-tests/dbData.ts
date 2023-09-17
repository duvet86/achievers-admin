import { PrismaClient } from "@prisma/client";

export async function createUserAsync() {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();

    await prisma.$transaction(async (tx) => {
      await tx.importedHistory.deleteMany();
      await tx.approvalbyMRC.deleteMany();
      await tx.eoIProfile.deleteMany();
      await tx.induction.deleteMany();
      await tx.policeCheck.deleteMany();
      await tx.reference.deleteMany();
      await tx.welcomeCall.deleteMany();
      await tx.wWCCheck.deleteMany();
      await tx.userAtChapter.deleteMany();
      await tx.user.deleteMany();

      let i: number;

      for (i = 0; i < 18; i++) {
        await tx.user.create({
          data: {
            azureADId: null,
            email: `test_${i}@test.com`,
            firstName: `test_${i}`,
            lastName: `user_${i}`,
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
            endDate: i === 17 ? new Date() : null,
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
                calledBy: "Pippo",
                calledOnDate: new Date(),
                comment: "Great guy",
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
            references: {
              createMany: {
                data: [
                  {
                    firstName: `referenceA_${i}`,
                    lastName: `lastnameA_${i}`,
                    mobile: "123",
                    email: "aaa@aaa.com",
                    bestTimeToContact: "",
                    relationship: "mother",
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
                    firstName: `referenceB_${i}`,
                    lastName: `lastnameB_${i}`,
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
                runBy: "Tony",
                completedOnDate: new Date(),
                comment: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
            policeCheck: {
              create: {
                expiryDate: new Date("2023-09-16"),
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
            wwcCheck: {
              create: {
                wwcNumber: "123456",
                expiryDate: new Date("2023-09-16"),
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
            approvalbyMRC: {
              create: {
                completedBy: "July",
                submittedDate: null,
                comment: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
            userAtChapter: {
              create: {
                assignedBy: "test-data",
                chapterId: (await tx.chapter.findFirstOrThrow()).id,
              },
            },
          },
        });
      }

      await tx.user.create({
        data: {
          azureADId: null,
          email: `test_${i}@test.com`,
          firstName: `test_${i}`,
          lastName: `user_${i}`,
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
          volunteerAgreementSignedOn: new Date(),
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
              calledBy: "Pippo",
              calledOnDate: new Date(),
              comment: "Great guy",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          references: {
            createMany: {
              data: [
                {
                  firstName: `referenceA_${i}`,
                  lastName: `lastnameA_${i}`,
                  mobile: "123",
                  email: "aaa@aaa.com",
                  bestTimeToContact: "",
                  relationship: "mother",
                  generalComment: null,
                  outcomeComment: null,
                  hasKnowApplicantForAYear: null,
                  isRelated: null,
                  isMentorRecommended: null,
                  calledBy: "test-data",
                  calledOndate: new Date(),
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                {
                  firstName: `referenceB_${i}`,
                  lastName: `lastnameB_${i}`,
                  mobile: "",
                  email: "bbb@bbb.com",
                  bestTimeToContact: "",
                  relationship: "",
                  generalComment: null,
                  outcomeComment: null,
                  hasKnowApplicantForAYear: null,
                  isRelated: null,
                  isMentorRecommended: null,
                  calledBy: "test-data",
                  calledOndate: new Date(),
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ],
            },
          },
          induction: {
            create: {
              runBy: "Tony",
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
              completedBy: "July",
              submittedDate: null,
              comment: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          userAtChapter: {
            create: {
              assignedBy: "test-data",
              chapterId: (await tx.chapter.findFirstOrThrow()).id,
            },
          },
        },
      });
    });
  } catch (e) {
    if (!(e as Error).message.includes("User_email_key")) {
      console.log(e);
    }
  } finally {
    await prisma.$disconnect();
  }
}
