import type { ImportedHistory, User } from "~/prisma/client";
import type { SpeadsheetUser } from "~/models/speadsheet";
import type { FileUpload } from "@mjackson/form-data-parser";

import { Readable } from "node:stream";
import { MemoryFileStorage } from "@mjackson/file-storage/memory";
import { stream, read, utils } from "xlsx";

import { prisma } from "~/db.server";
import { areEqualIgnoreCase, isValidDate } from "~/services";

const memoryFileStorage = new MemoryFileStorage();

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

export type UserHistory = User & {
  importedHistory: ImportedHistory | null;
};

export async function importSpreadsheetMentorsAsync(
  newUsers: SpeadsheetUser[],
): Promise<UserHistory[]> {
  const uniqueUsers = newUsers.filter(
    (obj, index) =>
      newUsers.findIndex((item) =>
        areEqualIgnoreCase(item["Email address"], obj["Email address"]),
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
    for (const uniqueUser of uniqueUsers) {
      const chapter = chapters.find((c) =>
        areEqualIgnoreCase(c.name, uniqueUser.Chapter),
      );

      let error = "";

      const isDateofBirthValid =
        uniqueUser["Date of Birth"] &&
        isValidDate(new Date(uniqueUser["Date of Birth"]));

      if (uniqueUser["Date of Birth"] && !isDateofBirthValid) {
        error += "Date of Birth is invalid.\n";
      }

      const isPoliceCheckDateValid =
        uniqueUser["Police Check Renewal Date"] &&
        isValidDate(new Date(uniqueUser["Police Check Renewal Date"]));

      if (uniqueUser["Police Check Renewal Date"] && !isPoliceCheckDateValid) {
        error += "Police Check Renewal Date is invalid.\n";
      }

      const isWWCDateValid =
        uniqueUser["WWC Check Renewal Date"] &&
        isValidDate(new Date(uniqueUser["WWC Check Renewal Date"]));

      if (uniqueUser["WWC Check Renewal Date"] && !isWWCDateValid) {
        error += "WWC Check Renewal Date is invalid.\n";
      }

      const isInductionDateValid =
        uniqueUser["Induction Date"] &&
        isValidDate(new Date(uniqueUser["Induction Date"]));

      if (uniqueUser["Induction Date"] && !isInductionDateValid) {
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
          addressStreet: uniqueUser["Residential Address"]
            ? uniqueUser["Residential Address"]
            : "",
          email: uniqueUser["Email address"],
          additionalEmail: uniqueUser[
            "Additional email addresses (for intranet access)"
          ]
            ? uniqueUser["Additional email addresses (for intranet access)"]
            : null,
          dateOfBirth: isDateofBirthValid
            ? new Date(uniqueUser["Date of Birth"])
            : null,
          emergencyContactAddress: uniqueUser["Emergency Contact Address"],
          emergencyContactName: uniqueUser["Emergency Contact Name"],
          emergencyContactNumber: uniqueUser["Emergency Contact Name"],
          emergencyContactRelationship:
            uniqueUser["Emergency Contact Relationship"],
          endDate: null,
          firstName: uniqueUser["First Name"],
          azureADId: null,
          lastName: uniqueUser["Last Name"],
          mobile: uniqueUser.Mobile.toString(),
          hasApprovedToPublishPhotos:
            uniqueUser["Approval to publish Potographs?"] === "Yes",
          volunteerAgreementSignedOn:
            uniqueUser["Volunteer Agreement Complete"] === "Yes"
              ? new Date()
              : undefined,
          chapterId: chapter?.id ?? chapters[0].id,
          eoIProfile: {
            create: {
              bestTimeToContact: "Not specified",
              comment: "Existing mentor imported by file.",
              heardAboutUs: "Not specified",
              isOver18: uniqueUser["Over the age of 18 years?"] === "Yes",
              mentoringLevel: "",
              occupation: uniqueUser.Occupation ? uniqueUser.Occupation : "",
              preferredFrequency: uniqueUser.Attendance
                ? uniqueUser.Attendance
                : "Not specified",
              volunteerExperience: "Not specified",
              role: uniqueUser["Role(s)"] ? uniqueUser["Role(s)"] : "",
              wasMentor: "Not specified",
            },
          },
          approvalbyMRC:
            uniqueUser["Approved by MRC?"] === "Yes"
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
                  completedOnDate: new Date(uniqueUser["Induction Date"]),
                  runBy: "imported mentor",
                  comment: "Imported mentor",
                },
              }
            : undefined,
          policeCheck: isPoliceCheckDateValid
            ? {
                create: {
                  expiryDate: new Date(uniqueUser["Police Check Renewal Date"]),
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
                  expiryDate: new Date(uniqueUser["WWC Check Renewal Date"]),
                  filePath: "",
                  wwcNumber: uniqueUser["WWC Check Number"]
                    ? uniqueUser["WWC Check Number"].toString()
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

export async function uploadHandler(fileUpload: FileUpload) {
  const storageKey = fileUpload.fieldName ?? "file";

  await memoryFileStorage.set(
    storageKey,
    new File([await fileUpload.bytes()], fileUpload.name, {
      type: fileUpload.type,
    }),
  );

  return memoryFileStorage.get(storageKey);
}
