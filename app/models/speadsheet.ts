export type BooleanAnswer = "Yes" | "No";
export type Chapter = "Girraween" | "Armadale" | "Butler";
export type Roles = "Mentor" | "Mentee" | "Member" | "Unknown";
export type Attendance = "Weekly" | "Fortnightly" | "Other";
export type VaccinationStatus = "Confirmed" | "Unconfirmed";

export interface SpeadsheetUser {
  "First Name": string;
  "Last Name": string;
  "Email address": string;
  "Additional email addresses (for intranet access)": string;
  Mobile: number;
  "Residential Address": string;
  "Date of Birth": string;
  "Over the age of 18 years?": BooleanAnswer;
  "Approval to publish Potographs?": BooleanAnswer;
  "Approved by MRC?": BooleanAnswer;
  Chapter: Chapter;
  "Role(s)": Roles;
  "Committee Member": BooleanAnswer; // Not used.
  "Current Member": BooleanAnswer; // Not used.
  "Induction Date": string;
  Attendance: Attendance;
  Mentee: string; // Not used.
  "Mentee Year Level": string; // Not used.
  "Police Check Renewal Date": string;
  "WWC Check Renewal Date": string;
  "Volunteer Agreement Complete": BooleanAnswer;
  "Board Member": BooleanAnswer; // Not used.
  "Emergency Contact Name": string;
  "Emergency Contact Number": string;
  "Emergency Contact Address": string;
  "Emergency Contact Relationship": string;
  "Director Identification Number": string; // Not used.
  "Board Term Expiry": string; // Not used.
  "End Date": string;
  Occupation: string;
  "Vaccination Status": VaccinationStatus; // Not used.
  "WWC Check Number": string;
  "Missing Information": string;
  "Active Volunteer": BooleanAnswer;
}
