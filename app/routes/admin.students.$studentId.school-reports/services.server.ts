import type { FileUpload } from "@mjackson/form-data-parser";

import { MemoryFileStorage } from "@mjackson/file-storage/memory";

import { prisma } from "~/db.server";
import {
  deleteBlobAsync,
  getContainerClient,
  getSASQueryString,
  STUDENT_DATA_BLOB_CONTAINER_NAME,
  uploadBlobAsync,
} from "~/services/.server";
import dayjs from "dayjs";

const memoryFileStorage = new MemoryFileStorage();

export interface SchoolReportCommand {
  schoolTermId: number;
  filePath: string;
}

export async function getStudentByIdAsync(studentId: number) {
  const student = await prisma.student.findUniqueOrThrow({
    where: {
      id: studentId,
    },
    select: {
      id: true,
      fullName: true,
      studentSchoolReport: {
        select: {
          id: true,
          filePath: true,
          schoolTerm: {
            select: {
              year: true,
              startDate: true,
              endDate: true,
            },
          },
        },
      },
    },
  });

  return {
    ...student,
    studentSchoolReport: undefined,
    schoolReports: student.studentSchoolReport.map((report) => ({
      id: report.id,
      fileName: report.filePath.split("/")[1],
      filePath: getFileUrl(report.filePath),
      schoolTermLabel: `${report.schoolTerm.year} (${dayjs(report.schoolTerm.startDate).format("D MMMM")} - ${dayjs(report.schoolTerm.endDate).format("D MMMM")})`,
    })),
  };
}

export async function uploadHandler(fileUpload: FileUpload) {
  const storageKey = fileUpload.fieldName ?? "file";

  await memoryFileStorage.set(
    storageKey,
    new File([await fileUpload.bytes()], fileUpload.name, {
      type: fileUpload.type,
    }),
  );

  return memoryFileStorage.get(storageKey);
}

export async function saveFileAsync(
  studentId: string,
  file: File,
): Promise<string> {
  if (file.size === 0) {
    throw new Error("File too small");
  }
  const allowedFormats = ["application/pdf", "image/png", "image/jpeg"];

  if (!allowedFormats.includes(file.type)) {
    throw new Error("Invalid extension.");
  }

  const containerClient = getContainerClient(STUDENT_DATA_BLOB_CONTAINER_NAME);
  await containerClient.createIfNotExists();

  const path = `${studentId}/${file.name}`;

  await uploadBlobAsync(containerClient, file, path);

  return path;
}

export async function deleteFileAsync(
  studentId: string,
  fileName: string,
): Promise<boolean> {
  const containerClient = getContainerClient(STUDENT_DATA_BLOB_CONTAINER_NAME);

  const path = `${studentId}/${fileName}`;

  const result = await deleteBlobAsync(containerClient, path);

  return result.succeeded;
}

export async function deleteSchoolReportAsync(reportId: number) {
  return await prisma.studentSchoolReport.delete({
    where: {
      id: reportId,
    },
  });
}

export async function saveSchoolReportAsync(
  studentId: number,
  data: SchoolReportCommand,
) {
  return await prisma.studentSchoolReport.create({
    data: {
      schoolTermId: data.schoolTermId,
      filePath: data.filePath,
      studentId,
    },
  });
}

function getFileUrl(path: string): string {
  const containerClient = getContainerClient(STUDENT_DATA_BLOB_CONTAINER_NAME);

  const blob = containerClient.getBlobClient(path);

  const sasQueryString = getSASQueryString(containerClient, path, 60);

  return `${blob.url}?${sasQueryString}`;
}
