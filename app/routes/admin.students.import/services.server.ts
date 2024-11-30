import type { ImportedStudentHistory, Student } from "@prisma/client";
import { type FileUpload } from "@mjackson/form-data-parser";
import type { SpeadsheetStudent } from "~/models/speadsheet";

import { Readable } from "node:stream";
import { stream, read, utils } from "xlsx";
import { MemoryFileStorage } from "@mjackson/file-storage/memory";
import { $Enums } from "@prisma/client";

import { prisma } from "~/db.server";
import { isValidDate } from "~/services";

const memoryFileStorage = new MemoryFileStorage();

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
    for (const newStudent of newStudents) {
      let error = "";

      const dateOfBirth = newStudent["Date of Birth"];
      const startDate = newStudent["Start Date"];

      const isDateofBirthValid =
        dateOfBirth && isValidDate(new Date(dateOfBirth));

      if (newStudent["Date of Birth"] && !isDateofBirthValid) {
        error += "Date of Birth is invalid.\n";
      }

      const isStartDateValid = startDate && isValidDate(new Date(startDate));

      const student = await tx.student.create({
        include: {
          importedStudentHistory: true,
        },
        data: {
          address: newStudent.Address?.trim(),
          bestContactMethod: newStudent["Best Contact Method"]?.trim(),
          bestPersonToContact: newStudent["Best Person to Contact"]?.trim(),
          dateOfBirth: isDateofBirthValid ? new Date(dateOfBirth) : null,
          emergencyContactAddress:
            newStudent["Emergency Contact Address"]?.trim(),
          emergencyContactEmail: newStudent["Emergency Contact Email"]?.trim(),
          emergencyContactFullName:
            newStudent["Emergency Contact Full Name"]?.trim(),
          emergencyContactPhone:
            newStudent["Emergency Contact Phone"]?.toString(),
          emergencyContactRelationship:
            newStudent["Emergency Contact Relationship"]?.trim(),
          firstName: newStudent["First Name"].trim(),
          gender:
            newStudent.Gender.trim() === "Female"
              ? $Enums.Gender.FEMALE
              : $Enums.Gender.MALE,
          lastName: newStudent["Last Name"].trim(),
          schoolName: newStudent["Name of School"]?.trim(),
          startDate: isStartDateValid ? new Date(startDate) : null,
          allergies: newStudent["Dietary Requirements/Allergies"]
            ? newStudent["Dietary Requirements/Allergies"].trim() === "Yes"
              ? true
              : false
            : undefined,
          endDate: null,
          hasApprovedToPublishPhotos: newStudent[
            "Approval to publish photographs?"
          ]
            ? newStudent["Approval to publish photographs?"].trim() === "Yes"
              ? true
              : false
            : undefined,
          guardian: {
            createMany: {
              data:
                newStudent["Parent/Gaurdian 1 Address"] != null &&
                newStudent["Parent/Gaurdian 1 Email"] != null &&
                newStudent["Parent/Gaurdian 1 Phone"] != null &&
                newStudent["Parent/Gaurdian 1 Relationship"] != null &&
                newStudent["Parent/Gaurdian 2 Address"] != null &&
                newStudent["Parent/Gaurdian 2 Email"] != null &&
                newStudent["Parent/Gaurdian 2 Phone"] != null &&
                newStudent["Parent/Gaurdian 2 Relationship"] != null
                  ? [
                      {
                        address: newStudent["Parent/Gaurdian 1 Address"].trim(),
                        email: newStudent["Parent/Gaurdian 1 Email"].trim(),
                        fullName:
                          newStudent["Parent/Gaurdian 1 Full name"]!.trim(),
                        phone: newStudent["Parent/Gaurdian 1 Phone"].toString(),
                        relationship:
                          newStudent["Parent/Gaurdian 1 Relationship"].trim(),
                      },
                      {
                        address: newStudent["Parent/Gaurdian 2 Address"].trim(),
                        email: newStudent["Parent/Gaurdian 2 Email"].trim(),
                        fullName:
                          newStudent["Parent/Gaurdian 2 Full name"]!.trim(),
                        phone: newStudent["Parent/Gaurdian 2 Phone"].toString(),
                        relationship:
                          newStudent["Parent/Gaurdian 2 Relationship"].trim(),
                      },
                    ]
                  : [],
            },
          },
          studentTeacher: {
            createMany: {
              data:
                newStudent["Teacher's Email"] != null &&
                newStudent["Teacher's Name (s)"] != null &&
                newStudent["Name of School"] != null
                  ? [
                      {
                        email: newStudent["Teacher's Email"].trim(),
                        fullName: newStudent["Teacher's Name (s)"].trim(),
                        schoolName: newStudent["Name of School"].trim(),
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

export async function uploadHandler(fileUpload: FileUpload) {
  const storageKey = fileUpload.fieldName ?? "file";

  memoryFileStorage.set(
    storageKey,
    new File([await fileUpload.bytes()], fileUpload.name),
  );

  return memoryFileStorage.get(storageKey);
}
