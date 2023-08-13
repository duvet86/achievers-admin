import type { User } from "@prisma/client";
import type { SpeadsheetUser } from "~/models/speadsheet";

import { Readable } from "stream";
import { stream, read, utils } from "xlsx";

import { prisma } from "~/db.server";
import { isValidDate } from "~/services";

export async function readExcelFileAsync(file: File) {
  stream.set_readable(Readable);

  const workbook = read(await file.arrayBuffer(), { cellDates: true });

  return workbook.SheetNames.flatMap((sheetName) => {
    const firstWs = workbook.Sheets[sheetName];

    return utils.sheet_to_json<SpeadsheetUser>(firstWs);
  });

  // const firstWs = workbook.Sheets[workbook.SheetNames[0]];

  // const sheetUsers = utils.sheet_to_json<SpeadsheetUser>(firstWs);

  // return sheetUsers;
}

export async function getImportHistoryAsync() {
  return await prisma.importedHistory.findMany({
    select: {
      error: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCurrentMentorsAsync() {
  return await prisma.user.findMany({
    select: {
      email: true,
    },
  });
}

export async function importSpreadsheetMentorsAsync(
  newUsers: SpeadsheetUser[],
): Promise<User[]> {
  const users: User[] = [];

  const chapters = await prisma.chapter.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < newUsers.length; i++) {
      const chapter = chapters.find((c) => c.name === newUsers[i]["Chapter"]);

      let error: string = "";

      const isDateofBirthValid =
        newUsers[i]["Date of Birth"] &&
        isValidDate(new Date(newUsers[i]["Date of Birth"]));

      if (newUsers[i]["Date of Birth"] && !isDateofBirthValid) {
        error += "Date of Birth is invalid.\n";
      }

      const isPoliceCheckDateValid =
        newUsers[i]["Police Check Renewal Date"] &&
        isValidDate(new Date(newUsers[i]["Police Check Renewal Date"]));

      if (newUsers[i]["Police Check Renewal Date"] && !isPoliceCheckDateValid) {
        error += "Police Check Renewal Date is invalid.\n";
      }

      const isWWCDateValid =
        newUsers[i]["WWC Check Renewal Date"] &&
        isValidDate(new Date(newUsers[i]["WWC Check Renewal Date"]));

      if (newUsers[i]["WWC Check Renewal Date"] && !isWWCDateValid) {
        error += "WWC Check Renewal Date is invalid.\n";
      }

      const isEndDateValid =
        newUsers[i]["End Date"] &&
        isValidDate(new Date(newUsers[i]["End Date"]));

      if (newUsers[i]["End Date"] && !isEndDateValid) {
        error += "End Date is invalid.\n";
      }

      const isInductionDateValid =
        newUsers[i]["Induction Date"] &&
        isValidDate(new Date(newUsers[i]["Induction Date"]));

      if (newUsers[i]["Induction Date"] && !isInductionDateValid) {
        error += "Induction Date is invalid.\n";
      }

      const user = await tx.user.create({
        data: {
          addressPostcode: "",
          addressState: "",
          addressSuburb: "",
          email: newUsers[i]["Email address"],
          addressStreet: newUsers[i]["Residential Address"],
          additionalEmail: newUsers[i][
            "Additional email addresses (for intranet access)"
          ]
            ? newUsers[i]["Additional email addresses (for intranet access)"]
            : null,
          dateOfBirth: isDateofBirthValid
            ? new Date(newUsers[i]["Date of Birth"])
            : null,
          emergencyContactAddress: newUsers[i]["Emergency Contact Address"],
          emergencyContactName: newUsers[i]["Emergency Contact Name"],
          emergencyContactNumber: newUsers[i]["Emergency Contact Name"],
          emergencyContactRelationship:
            newUsers[i]["Emergency Contact Relationship"],
          endDate: isEndDateValid ? new Date(newUsers[i]["End Date"]) : null,
          firstName: newUsers[i]["First Name"],
          azureADId: null,
          lastName: newUsers[i]["Last Name"],
          mobile: newUsers[i]["Mobile"].toString(),
          hasApprovedToPublishPhotos:
            newUsers[i]["Approval to publish Potographs?"] === "Yes",
          volunteerAgreementSignedOn:
            newUsers[i]["Volunteer Agreement Complete"] === "Yes"
              ? new Date()
              : undefined,
          userAtChapter: {
            create: {
              assignedBy: "import",
              chapterId: chapter?.id ?? chapters[0].id,
            },
          },
          eoIProfile: {
            create: {
              bestTimeToContact: "Not specified",
              comment: "Existing mentor imported by file.",
              heardAboutUs: "Not specified",
              isOver18: newUsers[i]["Over the age of 18 years?"] === "Yes",
              mentoringLevel: "",
              occupation: newUsers[i]["Occupation"]
                ? newUsers[i]["Occupation"]
                : "",
              preferredFrequency: "Not specified",
              volunteerExperience: "Not specified",
              role: "Not specified",
            },
          },
          approvalbyMRC:
            newUsers[i]["Approved by MRC?"] === "Yes"
              ? {
                  create: {
                    completedBy: "imported mentor",
                    submittedDate: new Date(),
                    comment: "Imported mentor",
                  },
                }
              : undefined,
          induction: isInductionDateValid
            ? {
                create: {
                  completedOnDate: new Date(newUsers[i]["Induction Date"]),
                  runBy: "imported mentor",
                  comment: "Imported mentor",
                },
              }
            : undefined,
          policeCheck: isPoliceCheckDateValid
            ? {
                create: {
                  expiryDate: new Date(
                    newUsers[i]["Police Check Renewal Date"],
                  ),
                  filePath: "",
                },
              }
            : undefined,
          references: {
            createMany: {
              data: [
                {
                  bestTimeToContact: "Not specified",
                  email: "Not specified",
                  firstName: "Not specified",
                  lastName: "Not specified",
                  mobile: "Not specified",
                  relationship: "Not specified",
                  calledBy: "import mentor",
                  calledOndate: new Date(),
                  generalComment: "Imported mentor",
                },
                {
                  bestTimeToContact: "Not specified",
                  email: "Not specified",
                  firstName: "Not specified",
                  lastName: "Not specified",
                  mobile: "Not specified",
                  relationship: "Not specified",
                  calledBy: "import mentor",
                  calledOndate: new Date(),
                  generalComment: "Imported mentor",
                },
              ],
            },
          },
          welcomeCall: {
            create: {
              calledBy: "import mentor",
              calledOnDate: new Date(),
              comment: "Imported mentor",
            },
          },
          wwcCheck: isWWCDateValid
            ? {
                create: {
                  expiryDate: new Date(newUsers[i]["WWC Check Renewal Date"]),
                  filePath: "",
                  wwcNumber: newUsers[i]["WWC Check Number"]
                    ? newUsers[i]["WWC Check Number"].toString()
                    : "Not specified",
                },
              }
            : undefined,
          importedHistory: {
            create: {
              error: error || null,
            },
          },
        },
      });

      users.push(user);
    }
  });

  return users;
}
