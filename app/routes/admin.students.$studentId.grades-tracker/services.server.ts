import { prisma } from "~/db.server";

export interface StudentGradeCommand {
  year: number;
  semester: string;
  subject: string;
  grade: string;
}

export const YEARS = [2025, 2024, 2023];

export const SEMESTERS: Record<string, string> = {
  sem1: "Semester 1",
  sem2: "Semester 2",
};

export const SUBJECTS: Record<string, string> = {
  ENG: "English",
  MATH: "Maths",
  SCIENCE: "Science",
  HUM: "Humanities and Social Sciences",
  DIGT: "Digital Technologies",
  FLANG: "Foreign Languages",
};

export const GRADES = ["A", "B", "C", "D", "E"];

export async function getStudentByIdAsync(id: number) {
  return await prisma.student.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function getStudentGradesCountAsync(
  studentId: number,
  year: number | null,
  semester: string | null,
  subject: string | null,
) {
  return await prisma.studentGrade.count({
    where: {
      studentId,
      year: year ?? undefined,
      semester: semester ?? undefined,
      subject: subject ?? undefined,
    },
  });
}

export async function getStudentGradesAsync(
  studentId: number,
  pageNumber: number,
  year: number | null,
  semester: string | null,
  subject: string | null,
  numberItems = 10,
) {
  const grades = await prisma.studentGrade.findMany({
    where: {
      studentId,
      year: year ?? undefined,
      semester: semester ?? undefined,
      subject: subject ?? undefined,
    },
    select: {
      id: true,
      year: true,
      semester: true,
      subject: true,
      grade: true,
    },
    orderBy: {
      year: "desc",
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });

  return grades.map(({ id, year, semester, subject, grade }) => ({
    id,
    year: year,
    semester: SEMESTERS[semester],
    subject: SUBJECTS[subject],
    grade: grade,
  }));
}

export async function getGradeAsync(
  studentId: number,
  year: number,
  semester: string,
  subject: string,
) {
  return await prisma.studentGrade.findUnique({
    where: {
      year_semester_subject_studentId: {
        studentId,
        year,
        semester,
        subject,
      },
    },
    select: {
      id: true,
    },
  });
}

export async function createStudentGradeAsync(
  studentId: number,
  gradeInfo: StudentGradeCommand,
) {
  return await prisma.studentGrade.create({
    select: {
      id: true,
    },
    data: {
      studentId,
      ...gradeInfo,
    },
  });
}

export async function deleteStudentGradeAsync(studentId: number) {
  return await prisma.studentGrade.delete({
    where: {
      id: studentId,
    },
  });
}
