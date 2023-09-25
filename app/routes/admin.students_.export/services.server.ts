import type { SpeadsheetStudent } from "~/models/speadsheet";

import { write, utils } from "xlsx";

import { prisma } from "~/db.server";

export async function exportStudentsToSpreadsheetAsync() {
  const mentors = await prisma.student.findMany({
    include: {
      guardian: true,
      studentTeacher: true,
    },
  });

  const speadsheetMentors = mentors.map<SpeadsheetStudent>((s) => ({
    "First Name": s.firstName,
    "Last Name": s.lastName,
    "Approval to publish photographs?":
      s.hasApprovedToPublishPhotos === true ? "Yes" : "No",
    "Start Date": s.startDate,
    "End Date": s.endDate?.toString() ?? undefined,
    "Date of Birth": s.dateOfBirth,
    Gender: s.gender === "MALE" ? "Male" : "Female",
    Address: s.address,
    "Dietary Requirements/Allergies": s.allergies === true ? "Yes" : "No",
    "Best Person to Contact": s.bestPersonToContact,
    "Best Contact Method": s.bestContactMethod,
    "Parent/Gaurdian 1 Full name": s.guardian[0].address,
    "Parent/Gaurdian 1 Relationship": s.guardian[0].relationship,
    "Parent/Gaurdian 1 Phone": Number(s.guardian[0].phone),
    "Parent/Gaurdian 1 Email": s.guardian[0].email,
    "Parent/Gaurdian 1 Address": s.guardian[0].address,
    "Parent/Gaurdian 2 Full name": s.guardian[1].address,
    "Parent/Gaurdian 2 Relationship": s.guardian[1].relationship,
    "Parent/Gaurdian 2 Phone": Number(s.guardian[1].phone),
    "Parent/Gaurdian 2 Email": s.guardian[1].email,
    "Parent/Gaurdian 2 Address": s.guardian[1].address,
    "Emergency Contact Full Name": s.emergencyContactFullName,
    "Emergency Contact Relationship": s.emergencyContactRelationship,
    "Emergency Contact Phone": Number(s.emergencyContactPhone),
    "Emergency Contact Email": s.emergencyContactEmail,
    "Emergency Contact Address": s.emergencyContactAddress,
    "Name of School": s.schoolName,
    "Year Level": s.yearLevel,
    "Teacher's Email": s.studentTeacher[0].email,
    "Teacher's Name (s)": s.studentTeacher[0].fullName,
  }));

  const wb = utils.book_new();

  utils.book_append_sheet(
    wb,
    utils.json_to_sheet<SpeadsheetStudent>(speadsheetMentors),
  );

  const buf = write(wb, { type: "buffer", bookType: "xlsx" });

  return buf;
}
