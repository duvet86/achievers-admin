export type BooleanAnswer = "Yes" | "No";
export type Chapter = "Girraween" | "Armadale" | "Butler";
export type Roles = "Mentor" | "Mentee" | "Member" | "Unknown";
export type Attendance = "Weekly" | "Fortnightly" | "Other";
export type VaccinationStatus = "Confirmed" | "Unconfirmed";
export type Gender = "Male" | "Female";

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
  "Induction Date": string;
  Attendance: Attendance;
  "Police Check Renewal Date": string;
  "WWC Check Renewal Date": string;
  "Volunteer Agreement Complete": BooleanAnswer;
  "Emergency Contact Name": string;
  "Emergency Contact Number": string;
  "Emergency Contact Address": string;
  "Emergency Contact Relationship": string;
  "End Date": string;
  Occupation: string;
  "WWC Check Number": string;
  "Missing Information": string;
  "Is Archived": BooleanAnswer;
}

export interface SpeadsheetStudent {
  "First Name": string;
  "Last Name": string;
  Gender: Gender;
  "Approval to publish photographs?": BooleanAnswer | undefined;
  "Start Date": Date | undefined;
  "End Date": string | undefined;
  "Date of Birth": Date | undefined;
  Address: string | undefined;
  "Dietary Requirements/Allergies": string | undefined;
  "Best Person to Contact": string | undefined;
  "Best Contact Method": string | undefined;
  "Parent/Gaurdian 1 Full name": string | undefined;
  "Parent/Gaurdian 1 Relationship": string | undefined;
  "Parent/Gaurdian 1 Phone": number | undefined;
  "Parent/Gaurdian 1 Email": string | undefined;
  "Parent/Gaurdian 1 Address": string | undefined;
  "Parent/Gaurdian 2 Full name": string | undefined;
  "Parent/Gaurdian 2 Relationship": string | undefined;
  "Parent/Gaurdian 2 Phone": number | undefined;
  "Parent/Gaurdian 2 Email": string | undefined;
  "Parent/Gaurdian 2 Address": string | undefined;
  "Emergency Contact Full Name": string | undefined;
  "Emergency Contact Relationship": string | undefined;
  "Emergency Contact Phone": number | undefined;
  "Emergency Contact Email": string | undefined;
  "Emergency Contact Address": string | undefined;
  "Name of School": string | undefined;
  "Year Level": number | string | undefined;
  "Teacher's Name (s)": string | undefined;
  "Teacher's Email": string | undefined;
}
