import dayjs from "dayjs";

import { prisma } from "~/db.server";
import {
  deleteBlobAsync,
  getContainerClient,
  getSASQueryString,
  STUDENT_DATA_BLOB_CONTAINER_NAME,
} from "~/services/.server";

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

export async function getSchoolReportsAsync(studentId: number) {
  const schoolReports = await prisma.studentSchoolReport.findMany({
    where: {
      studentId,
    },
    select: {
      id: true,
      label: true,
      filePath: true,
      schoolTerm: {
        select: {
          year: true,
          label: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  });

  return schoolReports.map(({ id, label, filePath, schoolTerm }) => {
    return {
      id,
      label,
      fileName: filePath.split("/")[1],
      filePath: getFileUrl(filePath),
      schoolTermLabel: `${schoolTerm.year} ${schoolTerm.label} (${dayjs(schoolTerm.startDate).format("D MMMM")} - ${dayjs(schoolTerm.endDate).format("D MMMM")})`,
    };
  });
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

function getFileUrl(path: string): string {
  const containerClient = getContainerClient(STUDENT_DATA_BLOB_CONTAINER_NAME);

  const blob = containerClient.getBlobClient(path);

  const sasQueryString = getSASQueryString(containerClient, path, 60);

  return `${blob.url}?${sasQueryString}`;
}
