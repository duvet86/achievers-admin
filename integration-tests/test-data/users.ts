import { randomNumber, makeAPerson, months } from "./utils";
import type { Prisma, PrismaClient } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { fakerEN_AU_ocker as faker } from "@faker-js/faker";

export async function createUsersAsync(
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
) {
  await prisma.$transaction(async (tx) => {
    await tx.importedHistory.deleteMany();
    await tx.mentorToStudentAssignement.deleteMany();
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
      const {
        additionalEmail,
        dateOfBirth,
        email,
        firstName,
        lastName,
        mobile,
        street,
        suburb,
        state,
        postcode,
        occupation,
        isOver18,
      } = makeAPerson();
      const emergency = makeAPerson();
      const kin = makeAPerson();
      await tx.user.create({
        data: {
          azureADId: null,
          email,
          firstName,
          lastName,
          mobile,
          addressStreet: street,
          addressSuburb: suburb,
          addressState: state,
          addressPostcode: postcode,
          additionalEmail: randomNumber(1) ? additionalEmail : null,
          dateOfBirth,
          emergencyContactName: emergency.fullName,
          emergencyContactNumber: emergency.mobile,
          emergencyContactAddress: emergency.address,
          emergencyContactRelationship: emergency.relationship,
          nextOfKinName: kin.fullName,
          nextOfKinNumber: kin.mobile,
          nextOfKinAddress: kin.address,
          nextOfKinRelationship: kin.relationship,
          profilePicturePath: null,
          hasApprovedToPublishPhotos: !!randomNumber(1),
          endDate: randomNumber(10) ? null : new Date(),
          volunteerAgreementSignedOn: randomNumber(1) ? new Date() : null,
          createdAt: new Date(),
          updatedAt: new Date(),
          eoIProfile: {
            create: {
              bestTimeToContact: "Afternoon after 3pm",
              occupation,
              volunteerExperience: "None",
              role: "Mentor",
              mentoringLevel: "2 years at Curtin university",
              preferredFrequency: "every week",
              heardAboutUs: "Linkid",
              isOver18,
              comment: "I am ready to rock",
              aboutMe:
                "I have a lot of energy and I want to share it with everyone",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          welcomeCall: {
            create: {
              calledBy: faker.person.firstName(),
              calledOnDate: faker.date.recent({ days: 7 }),
              comment: "Great guy",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          references: {
            createMany: {
              data: Array(2)
                .fill(1)
                .map((_) => {
                  const {
                    firstName,
                    lastName,
                    mobile,
                    email,
                    relationship,
                    isRelated,
                  } = makeAPerson();
                  return {
                    firstName,
                    lastName,
                    mobile,
                    email,
                    bestTimeToContact: "",
                    relationship,
                    generalComment: null,
                    outcomeComment: null,
                    hasKnowApplicantForAYear: null,
                    isRelated,
                    isMentorRecommended: null,
                    calledBy: null,
                    calledOndate: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  } satisfies Prisma.ReferenceCreateManyUserInput;
                }),
            },
          },
          induction: {
            create: {
              runBy: faker.person.firstName(),
              completedOnDate: faker.date.recent({ days: 14 }),
              comment: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          policeCheck: {
            create: {
              expiryDate: faker.date.future({ years: 1 }),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          wwcCheck: {
            create: {
              wwcNumber: randomNumber(1000000).toString(),
              expiryDate: faker.date.future({ years: 1 }),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          approvalbyMRC: {
            create: {
              completedBy: months[faker.date.soon({ days: 14 }).getMonth() + 1],
              submittedDate: faker.date.recent({ days: 14 }),
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
}
