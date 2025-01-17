import type { Term } from "~/models";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { prisma } from "~/db.server";
import { getDatesForTerm } from "~/services";

dayjs.extend(utc);
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

export type ActionType = "completed" | "remove-complete" | "draft" | "cancel";

export interface SessionCommandRequest {
  type: ActionType;
  sessionId: number | null;
  studentSessionId: number | null;
  studentId: number;
  attendedOn: string;
  report: string;
}

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.user.findUniqueOrThrow({
    where: {
      azureADId,
    },
    select: {
      id: true,
      chapterId: true,
    },
  });
}

export async function geSessionAsync(
  mentorId: number,
  studentId: number,
  chapterId: number,
  attendedOn: string,
) {
  const session = await prisma.session.findUnique({
    where: {
      mentorId_chapterId_attendedOn: {
        mentorId,
        chapterId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
    },
    select: {
      id: true,
      mentorId: true,
      attendedOn: true,
      mentor: {
        select: {
          fullName: true,
        },
      },
    },
  });

  if (session === null) {
    return null;
  }

  const studentSession = await prisma.studentSession.findUnique({
    where: {
      sessionId_studentId: {
        sessionId: session.id,
        studentId,
      },
    },
    select: {
      id: true,
      report: true,
      completedOn: true,
      signedOffOn: true,
      reportFeedback: true,
      isCancelled: true,
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  return { ...session, studentSession };
}

export async function getMentorSessionDatesAsync(
  mentorId: number,
  chapterId: number,
  currentTerm: Term,
) {
  const sessions = await prisma.session.findMany({
    distinct: "attendedOn",
    where: {
      mentorId,
      chapterId,
      AND: [
        {
          attendedOn: {
            gte: currentTerm.start.toDate(),
          },
        },
        {
          attendedOn: {
            lte: currentTerm.end.toDate(),
          },
        },
      ],
    },
    select: {
      attendedOn: true,
    },
  });

  return sessions.map(({ attendedOn }) =>
    dayjs(attendedOn).format("YYYY-MM-DD"),
  );
}

export function getSessionDatesFormatted(
  sessionDates: string[],
  currentTerm: Term,
) {
  return getDatesForTerm(currentTerm.start, currentTerm.end)
    .map((attendedOn) => dayjs(attendedOn))
    .map((attendedOn) => {
      const isBooked = sessionDates.includes(attendedOn.format("YYYY-MM-DD"));

      return {
        value: attendedOn.toISOString(),
        label: isBooked
          ? `** ${attendedOn.format("DD/MM/YYYY")} (Booked) **`
          : attendedOn.format("DD/MM/YYYY"),
        isBooked,
      };
    });
}

export async function saveReportAsync(
  actionType: ActionType,
  sessionId: number | null,
  mentorId: number,
  chapterId: number,
  studentId: number,
  attendedOn: string,
  report: string,
) {
  let completedOn: Date | null;
  let isCancelled = false;
  switch (actionType) {
    case "cancel":
      completedOn = new Date();
      isCancelled = true;
      break;
    case "completed":
      completedOn = new Date();
      break;
    case "draft":
    case "remove-complete":
    default:
      completedOn = null;
      break;
  }

  if (sessionId === null) {
    return await prisma.session.create({
      data: {
        chapterId,
        mentorId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
        studentSession: {
          create: {
            studentId,
            report,
            completedOn,
            isCancelled,
          },
        },
      },
    });
  }

  return await prisma.studentSession.upsert({
    where: {
      sessionId_studentId: {
        sessionId: sessionId,
        studentId,
      },
    },
    create: {
      report,
      completedOn,
      sessionId,
      studentId,
      isCancelled,
    },
    update: {
      report,
      completedOn,
      isCancelled,
    },
  });
}

export async function getStudentsAsync(userId: number, chapterId: number) {
  const assignedStudents = await prisma.mentorToStudentAssignement.findMany({
    where: {
      userId,
      student: {
        endDate: null,
      },
    },
    select: {
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  const allStudents = await prisma.student.findMany({
    where: {
      chapterId,
      endDate: null,
      mentorToStudentAssignement: {
        none: {
          userId,
        },
      },
    },
    select: {
      id: true,
      fullName: true,
    },
  });

  return assignedStudents
    .map(({ student: { id, fullName } }) => ({
      id,
      fullName: `** ${fullName} (Assigned) **`,
    }))
    .concat(allStudents);
}
