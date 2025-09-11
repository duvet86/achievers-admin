import { prisma } from "~/db.server";
import {
  getContainerClient,
  getSASQueryString,
  STUDENT_DATA_BLOB_CONTAINER_NAME,
  uploadBlobAsync,
} from "~/services/.server";

export interface SchoolReportCreateCommand {
  schoolTermId: number;
  label: string;
  filePath: string;
}

export interface SchoolReportUpdateCommand {
  schoolTermId: number;
  label: string;
}

export async function getStudentInfoAsync(studentId: number) {
  return await prisma.student.findUniqueOrThrow({
    where: {
      id: studentId,
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function getSchoolReportAsync(reportId: number) {
  const schoolReport = await prisma.studentSchoolReport.findUniqueOrThrow({
    where: {
      id: reportId,
    },
    select: {
      id: true,
      label: true,
      filePath: true,
      schoolTerm: {
        select: {
          id: true,
          label: true,
          year: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  });

  return {
    ...schoolReport,
    filePath: getFileUrl(schoolReport.filePath),
  };
}

export async function saveFileAsync(
  studentId: string,
  file: File,
): Promise<string> {
  if (file.size === 0) {
    throw new Error("File too small");
  }
  const allowedFormats = ["application/pdf", "image/png", "image/jpeg"];

  console.log("file.type", file.type);

  if (!allowedFormats.includes(file.type)) {
    throw new Error("Invalid extension.");
  }

  const containerClient = getContainerClient(STUDENT_DATA_BLOB_CONTAINER_NAME);
  await containerClient.createIfNotExists();

  const path = `${studentId}/${file.name}`;

  await uploadBlobAsync(containerClient, file, path);

  return path;
}
export async function saveSchoolReportAsync(
  studentId: number,
  data: SchoolReportCreateCommand,
) {
  return await prisma.studentSchoolReport.create({
    data: {
      schoolTermId: data.schoolTermId,
      filePath: data.filePath,
      label: data.label,
      studentId,
    },
    select: {
      id: true,
    },
  });
}

export async function updateSchoolReportAsync(
  reportId: number,
  data: SchoolReportUpdateCommand,
) {
  return await prisma.studentSchoolReport.update({
    where: {
      id: reportId,
    },
    data,
    select: {
      id: true,
    },
  });
}

function getFileUrl(path: string): string {
  const containerClient = getContainerClient(STUDENT_DATA_BLOB_CONTAINER_NAME);

  const blob = containerClient.getBlobClient(path);

  const sasQueryString = getSASQueryString(containerClient, path, 60);

  return `${blob.url}?${sasQueryString}`;
}
