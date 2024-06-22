import type { ImportedStudentHistory, Student } from "@prisma/client";
import type { SpeadsheetStudent } from "~/models/speadsheet";

import { Readable } from "node:stream";
import { stream, read, utils } from "xlsx";
import { $Enums } from "@prisma/client";

import { prisma } from "~/db.server";
import { isValidDate } from "~/services";

export async function readExcelFileAsync(file: File) {
  stream.set_readable(Readable);

  const workbook = read(await file.arrayBuffer(), { cellDates: true });

  return workbook.SheetNames.flatMap((sheetName) => {
    const firstWs = workbook.Sheets[sheetName];

    return utils.sheet_to_json<SpeadsheetStudent>(firstWs);
  });
}

export async function getCurrentStudentsAsync() {
  return await prisma.student.findMany({
    select: {
      firstName: true,
      lastName: true,
      dateOfBirth: true,
    },
  });
}

export type StudentHistory = Student & {
  importedStudentHistory: ImportedStudentHistory | null;
};

export async function importSpreadsheetStudentsAsync(
  newStudents: SpeadsheetStudent[],
): Promise<StudentHistory[]> {
  const students: StudentHistory[] = [];

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < newStudents.length; i++) {
      let error: string = "";

      const dateOfBirth = newStudents[i]["Date of Birth"];
      const startDate = newStudents[i]["Start Date"];

      const isDateofBirthValid =
        dateOfBirth && isValidDate(new Date(dateOfBirth));

      if (newStudents[i]["Date of Birth"] && !isDateofBirthValid) {
        error += "Date of Birth is invalid.\n";
      }

      const isStartDateValid = startDate && isValidDate(new Date(startDate));

      const student = await tx.student.create({
        include: {
          importedStudentHistory: true,
        },
        data: {
          address: newStudents[i]["Address"]?.trim(),
          bestContactMethod: newStudents[i]["Best Contact Method"]?.trim(),
          bestPersonToContact: newStudents[i]["Best Person to Contact"]?.trim(),
          dateOfBirth: isDateofBirthValid ? new Date(dateOfBirth) : null,
          emergencyContactAddress:
            newStudents[i]["Emergency Contact Address"]?.trim(),
          emergencyContactEmail:
            newStudents[i]["Emergency Contact Email"]?.trim(),
          emergencyContactFullName:
            newStudents[i]["Emergency Contact Full Name"]?.trim(),
          emergencyContactPhone:
            newStudents[i]["Emergency Contact Phone"]?.toString(),
          emergencyContactRelationship:
            newStudents[i]["Emergency Contact Relationship"]?.trim(),
          firstName: newStudents[i]["First Name"].trim(),
          gender:
            newStudents[i]["Gender"].trim() === "Female"
              ? $Enums.Gender.FEMALE
              : $Enums.Gender.MALE,
          lastName: newStudents[i]["Last Name"].trim(),
          schoolName: newStudents[i]["Name of School"]?.trim(),
          startDate: isStartDateValid ? new Date(startDate) : null,
          allergies: newStudents[i]["Dietary Requirements/Allergies"]
            ? newStudents[i]["Dietary Requirements/Allergies"]!.trim() === "Yes"
              ? true
              : false
            : undefined,
          endDate: null,
          hasApprovedToPublishPhotos: newStudents[i][
            "Approval to publish photographs?"
          ]
            ? newStudents[i]["Approval to publish photographs?"]!.trim() ===
              "Yes"
              ? true
              : false
            : undefined,
          guardian: {
            createMany: {
              data:
                newStudents[i]["Parent/Gaurdian 1 Address"] != null &&
                newStudents[i]["Parent/Gaurdian 1 Email"] != null &&
                newStudents[i]["Parent/Gaurdian 1 Phone"] != null &&
                newStudents[i]["Parent/Gaurdian 1 Relationship"] != null &&
                newStudents[i]["Parent/Gaurdian 2 Address"] != null &&
                newStudents[i]["Parent/Gaurdian 2 Email"] != null &&
                newStudents[i]["Parent/Gaurdian 2 Phone"] != null &&
                newStudents[i]["Parent/Gaurdian 2 Relationship"] != null
                  ? [
                      {
                        address:
                          newStudents[i]["Parent/Gaurdian 1 Address"]!.trim(),
                        email:
                          newStudents[i]["Parent/Gaurdian 1 Email"]!.trim(),
                        fullName:
                          newStudents[i]["Parent/Gaurdian 1 Full name"]!.trim(),
                        phone:
                          newStudents[i]["Parent/Gaurdian 1 Phone"]!.toString(),
                        relationship:
                          newStudents[i][
                            "Parent/Gaurdian 1 Relationship"
                          ]!.trim(),
                      },
                      {
                        address:
                          newStudents[i]["Parent/Gaurdian 2 Address"]!.trim(),
                        email:
                          newStudents[i]["Parent/Gaurdian 2 Email"]!.trim(),
                        fullName:
                          newStudents[i]["Parent/Gaurdian 2 Full name"]!.trim(),
                        phone:
                          newStudents[i]["Parent/Gaurdian 2 Phone"]!.toString(),
                        relationship:
                          newStudents[i][
                            "Parent/Gaurdian 2 Relationship"
                          ]!.trim(),
                      },
                    ]
                  : [],
            },
          },
          studentTeacher: {
            createMany: {
              data:
                newStudents[i]["Teacher's Email"] != null &&
                newStudents[i]["Teacher's Name (s)"] != null &&
                newStudents[i]["Name of School"] != null
                  ? [
                      {
                        email: newStudents[i]["Teacher's Email"]!.trim(),
                        fullName: newStudents[i]["Teacher's Name (s)"]!.trim(),
                        schoolName: newStudents[i]["Name of School"]!.trim(),
                      },
                    ]
                  : [],
            },
          },
          importedStudentHistory: {
            create: {
              error: error ? error : undefined,
            },
          },
          chapterId: 1,
        },
      });

      students.push(student);
    }
  });

  return students;
}
