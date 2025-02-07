import dayjs from "dayjs";
import { prisma } from "~/db.server";
import {
  getContainerClient,
  getSASQueryString,
  STUDENT_DATA_BLOB_CONTAINER_NAME,
} from "~/services/.server";

export async function getStudentByIdAsync(studentId: number) {
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

export async function getSchoolReportsForStudentIdAsync(studentId: number) {
  const reports = await prisma.studentSchoolReport.findMany({
    where: {
      studentId,
    },
    select: {
      id: true,
      filePath: true,
      schoolTerm: {
        select: {
          startDate: true,
          endDate: true,
        },
      },
    },
    orderBy: {
      schoolTerm: {
        startDate: "desc",
      },
    },
  });

  return reports.map((report) => ({
    ...report,
    fileName: report.filePath.split("/")[1],
    filePath: getFileUrl(report.filePath),
    schoolTerm: {
      startDate: dayjs(report.schoolTerm.startDate).format("DD/MM/YYYY"),
      endDate: dayjs(report.schoolTerm.endDate).format("DD/MM/YYYY"),
    },
  }));
}

function getFileUrl(path: string): string {
  const containerClient = getContainerClient(STUDENT_DATA_BLOB_CONTAINER_NAME);

  const blob = containerClient.getBlobClient(path);

  const sasQueryString = getSASQueryString(containerClient, path, 60);

  return `${blob.url}?${sasQueryString}`;
}
