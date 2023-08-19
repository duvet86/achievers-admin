import type { ImportedHistory, User } from "@prisma/client";
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
}

export async function getCurrentMentorsAsync() {
  return await prisma.user.findMany({
    select: {
      email: true,
    },
  });
}

type UserHistory = User & {
  importedHistory: ImportedHistory | null;
};

export async function importSpreadsheetMentorsAsync(
  newUsers: SpeadsheetUser[],
): Promise<UserHistory[]> {
  const newUsersReversed = newUsers.reverse();

  const uniqueUsers = newUsersReversed.filter(
    (obj, index) =>
      newUsersReversed.findIndex(
        (item) => item["Email address"] === obj["Email address"],
      ) === index,
  );

  const users: UserHistory[] = [];

  const chapters = await prisma.chapter.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < uniqueUsers.length; i++) {
      const chapter = chapters.find(
        (c) => c.name === uniqueUsers[i]["Chapter"],
      );

      let error: string = "";

      const isDateofBirthValid =
        uniqueUsers[i]["Date of Birth"] &&
        isValidDate(new Date(uniqueUsers[i]["Date of Birth"]));

      if (uniqueUsers[i]["Date of Birth"] && !isDateofBirthValid) {
        error += "Date of Birth is invalid.\n";
      }

      const isPoliceCheckDateValid =
        uniqueUsers[i]["Police Check Renewal Date"] &&
        isValidDate(new Date(uniqueUsers[i]["Police Check Renewal Date"]));

      if (
        uniqueUsers[i]["Police Check Renewal Date"] &&
        !isPoliceCheckDateValid
      ) {
        error += "Police Check Renewal Date is invalid.\n";
      }

      const isWWCDateValid =
        uniqueUsers[i]["WWC Check Renewal Date"] &&
        isValidDate(new Date(uniqueUsers[i]["WWC Check Renewal Date"]));

      if (uniqueUsers[i]["WWC Check Renewal Date"] && !isWWCDateValid) {
        error += "WWC Check Renewal Date is invalid.\n";
      }

      const isEndDateValid =
        uniqueUsers[i]["End Date"] &&
        isValidDate(new Date(uniqueUsers[i]["End Date"]));

      if (uniqueUsers[i]["End Date"] && !isEndDateValid) {
        error += "End Date is invalid.\n";
      }

      const isInductionDateValid =
        uniqueUsers[i]["Induction Date"] &&
        isValidDate(new Date(uniqueUsers[i]["Induction Date"]));

      if (uniqueUsers[i]["Induction Date"] && !isInductionDateValid) {
        error += "Induction Date is invalid.\n";
      }

      const user = await tx.user.create({
        include: {
          importedHistory: true,
        },
        data: {
          addressPostcode: "",
          addressState: "",
          addressSuburb: "",
          email: uniqueUsers[i]["Email address"],
          addressStreet: uniqueUsers[i]["Residential Address"],
          additionalEmail: uniqueUsers[i][
            "Additional email addresses (for intranet access)"
          ]
            ? uniqueUsers[i]["Additional email addresses (for intranet access)"]
            : null,
          dateOfBirth: isDateofBirthValid
            ? new Date(uniqueUsers[i]["Date of Birth"])
            : null,
          emergencyContactAddress: uniqueUsers[i]["Emergency Contact Address"],
          emergencyContactName: uniqueUsers[i]["Emergency Contact Name"],
          emergencyContactNumber: uniqueUsers[i]["Emergency Contact Name"],
          emergencyContactRelationship:
            uniqueUsers[i]["Emergency Contact Relationship"],
          endDate: isEndDateValid ? new Date(uniqueUsers[i]["End Date"]) : null,
          firstName: uniqueUsers[i]["First Name"],
          azureADId: null,
          lastName: uniqueUsers[i]["Last Name"],
          mobile: uniqueUsers[i]["Mobile"].toString(),
          hasApprovedToPublishPhotos:
            uniqueUsers[i]["Approval to publish Potographs?"] === "Yes",
          volunteerAgreementSignedOn:
            uniqueUsers[i]["Volunteer Agreement Complete"] === "Yes"
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
              isOver18: uniqueUsers[i]["Over the age of 18 years?"] === "Yes",
              mentoringLevel: "",
              occupation: uniqueUsers[i]["Occupation"]
                ? uniqueUsers[i]["Occupation"]
                : "",
              preferredFrequency: "Not specified",
              volunteerExperience: "Not specified",
              role: "Not specified",
            },
          },
          approvalbyMRC:
            uniqueUsers[i]["Approved by MRC?"] === "Yes"
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
                  completedOnDate: new Date(uniqueUsers[i]["Induction Date"]),
                  runBy: "imported mentor",
                  comment: "Imported mentor",
                },
              }
            : undefined,
          policeCheck: isPoliceCheckDateValid
            ? {
                create: {
                  expiryDate: new Date(
                    uniqueUsers[i]["Police Check Renewal Date"],
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
                  expiryDate: new Date(
                    uniqueUsers[i]["WWC Check Renewal Date"],
                  ),
                  filePath: "",
                  wwcNumber: uniqueUsers[i]["WWC Check Number"]
                    ? uniqueUsers[i]["WWC Check Number"].toString()
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
