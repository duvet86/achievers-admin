import type { SpreadsheetStudent } from "~/models/spreadsheet";

import { prisma } from "~/db.server";
import { calculateYearLevel } from "~/services";
import { addCollectionToSpreadsheet } from "~/services/.server";

export async function exportStudentsToSpreadsheetAsync() {
  const students = await prisma.student.findMany({
    include: {
      guardian: true,
      studentTeacher: true,
      chapter: true,
    },
  });

  const spreadsheetMentors = students.map<SpreadsheetStudent>((s) => ({
    "First Name": s.firstName,
    "Last Name": s.lastName,
    Chapter: s.chapter.name,
    "Approval to publish photographs?":
      s.hasApprovedToPublishPhotos === true ? "Yes" : "No",
    "Start Date": s.startDate ?? undefined,
    "End Date": s.endDate?.toString() ?? undefined,
    "Date of Birth": s.dateOfBirth ?? undefined,
    Gender: s.gender === "MALE" ? "Male" : "Female",
    Address: s.address ?? undefined,
    "Dietary Requirements/Allergies": s.allergies === true ? "Yes" : "No",
    "Best Person to Contact": s.bestPersonToContact ?? undefined,
    "Best Contact Method": s.bestContactMethod ?? undefined,
    "Parent/Guardian 1 Full name": s.guardian[0]?.address ?? undefined,
    "Parent/Guardian 1 Relationship": s.guardian[0]?.relationship ?? undefined,
    "Parent/Guardian 1 Phone": s.guardian[0]?.phone
      ? Number(s.guardian[0].phone)
      : undefined,
    "Parent/Guardian 1 Email": s.guardian[0]?.email ?? undefined,
    "Parent/Guardian 1 Address": s.guardian[0]?.address ?? undefined,
    "Parent/Guardian 2 Full name": s.guardian[1]?.address ?? undefined,
    "Parent/Guardian 2 Relationship": s.guardian[1]?.relationship ?? undefined,
    "Parent/Guardian 2 Phone": s.guardian[1]?.phone
      ? Number(s.guardian[1].phone)
      : undefined,
    "Parent/Guardian 2 Email": s.guardian[1]?.email ?? undefined,
    "Parent/Guardian 2 Address": s.guardian[1]?.address ?? undefined,
    "Emergency Contact Full Name": s.emergencyContactFullName ?? undefined,
    "Emergency Contact Relationship":
      s.emergencyContactRelationship ?? undefined,
    "Emergency Contact Phone":
      s.emergencyContactPhone != null
        ? Number(s.emergencyContactPhone)
        : undefined,
    "Emergency Contact Email": s.emergencyContactEmail ?? undefined,
    "Emergency Contact Address": s.emergencyContactAddress ?? undefined,
    "Name of School": s.schoolName ?? undefined,
    "Year Level": calculateYearLevel(s.dateOfBirth)?.toString(),
    "Teacher's Email": s.studentTeacher[0]?.email ?? undefined,
    "Teacher's Name (s)": s.studentTeacher[0]?.fullName ?? undefined,
  }));

  return addCollectionToSpreadsheet(spreadsheetMentors);
}
