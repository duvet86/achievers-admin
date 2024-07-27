import type { Attendance, Chapter, SpeadsheetUser } from "~/models/speadsheet";

import { write, utils } from "xlsx";

import { prisma } from "~/db.server";

export async function exportMentorsToSpreadsheetAsync() {
  const mentors = await prisma.user.findMany({
    include: {
      chapter: true,
      importedHistory: {
        select: {
          error: true,
        },
      },
      approvalbyMRC: true,
      eoIProfile: true,
      induction: true,
      policeCheck: true,
      references: true,
      welcomeCall: true,
      wwcCheck: true,
    },
  });

  const speadsheetMentors = mentors.map<SpeadsheetUser>((m) => ({
    "First Name": m.firstName,
    "Last Name": m.lastName,
    "Email address": m.email,
    "Additional email addresses (for intranet access)": m.additionalEmail ?? "",
    Mobile: Number(m.mobile),
    "Residential Address":
      m.addressStreet +
      " " +
      m.addressSuburb +
      " " +
      m.addressState +
      " " +
      m.addressPostcode,
    "Date of Birth": m.dateOfBirth?.toString() ?? "",
    "Over the age of 18 years?": m.eoIProfile?.isOver18 === true ? "Yes" : "No",
    "Approval to publish Potographs?": m.hasApprovedToPublishPhotos
      ? "Yes"
      : "No",
    "Approved by MRC?": m.approvalbyMRC ? "Yes" : "No",
    Chapter: (m.chapter.name as Chapter) ?? "Girraween",
    "Role(s)": "Mentor",
    "Committee Member": "No", // Not used.
    "Current Member": m.endDate !== undefined ? "Yes" : "No", // Not used.
    "Induction Date": m.induction?.completedOnDate.toString() ?? "",
    "Active Mentor": m.endDate !== undefined ? "Yes" : "No", // Not used.
    Attendance: m.eoIProfile?.preferredFrequency as Attendance, // Not used.
    Mentee: "", // Not used.
    "Mentee Year Level": "", // Not used.
    "Police Check Renewal Date": m.policeCheck?.expiryDate.toString() ?? "",
    "WWC Check Renewal Date": m.wwcCheck?.expiryDate.toString() ?? "",
    "Volunteer Agreement Complete":
      m.volunteerAgreementSignedOn !== undefined ? "Yes" : "No",
    "Board Member": "No", // Not used.
    "Emergency Contact Name": m.emergencyContactName ?? "",
    "Emergency Contact Number": m.emergencyContactNumber ?? "",
    "Emergency Contact Address": m.emergencyContactAddress ?? "",
    "Emergency Contact Relationship": m.emergencyContactRelationship ?? "",
    "Director Identification Number": "", // Not used.
    "Board Term Expiry": "", // Not used.
    "End Date": m.endDate?.toString() ?? "",
    Occupation: m.eoIProfile?.occupation ?? "",
    "Vaccination Status": "Unconfirmed", // Not used.
    "WWC Check Number": m.wwcCheck?.wwcNumber ?? "",
    "Missing Information": m.importedHistory?.error ?? "",
    "Active Volunteer": m.endDate === null ? "No" : "Yes",
  }));

  const wb = utils.book_new();

  utils.book_append_sheet(
    wb,
    utils.json_to_sheet<SpeadsheetUser>(speadsheetMentors),
  );

  const buf  = write(wb, { type: "buffer", bookType: "xlsx" }) as ReadableStream;

  return buf;
}
