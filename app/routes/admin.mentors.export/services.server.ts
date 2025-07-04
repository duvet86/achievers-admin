import type { Attendance, Chapter, SpeadsheetUser } from "~/models/speadsheet";

import { write, utils } from "xlsx";
import dayjs from "dayjs";

import { prisma } from "~/db.server";

export async function exportMentorsToSpreadsheetAsync() {
  const mentors = await prisma.mentor.findMany({
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
    "Date of Birth":
      m.dateOfBirth !== null ? dayjs(m.dateOfBirth).format("MM/DD/YYYY") : "",
    "Over the age of 18 years?": m.eoIProfile?.isOver18 === true ? "Yes" : "No",
    "Approval to publish Potographs?": m.hasApprovedToPublishPhotos
      ? "Yes"
      : "No",
    "Approved by MRC?": m.approvalbyMRC ? "Yes" : "No",
    Chapter: (m.chapter.name as Chapter) ?? "Girraween",
    "Role(s)": "Mentor",
    "Induction Date": m.induction?.completedOnDate.toString() ?? "",
    Attendance: m.eoIProfile?.preferredFrequency as Attendance,
    "Police Check Renewal Date": m.policeCheck?.expiryDate.toString() ?? "",
    "WWC Check Renewal Date": m.wwcCheck?.expiryDate
      ? dayjs(m.wwcCheck.expiryDate).format("MM/DD/YYYY")
      : "",
    "Volunteer Agreement Complete":
      m.volunteerAgreementSignedOn !== undefined ? "Yes" : "No",
    "Emergency Contact Name": m.emergencyContactName ?? "",
    "Emergency Contact Number": m.emergencyContactNumber ?? "",
    "Emergency Contact Address": m.emergencyContactAddress ?? "",
    "Emergency Contact Relationship": m.emergencyContactRelationship ?? "",
    Occupation: m.eoIProfile?.occupation ?? "",
    "WWC Check Number": m.wwcCheck?.wwcNumber ?? "",
    "Missing Information": m.importedHistory?.error ?? "",
    "End Date": m.endDate ? dayjs(m.endDate).format("MM/DD/YYYY") : "",
    "Is Archived": m.endDate !== null ? "Yes" : "No",
  }));

  const wb = utils.book_new();

  utils.book_append_sheet(
    wb,
    utils.json_to_sheet<SpeadsheetUser>(speadsheetMentors),
  );

  const buf = write(wb, { type: "buffer", bookType: "xlsx" }) as ReadableStream;

  return buf;
}
