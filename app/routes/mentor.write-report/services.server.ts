import type { Term } from "~/models";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { prisma } from "~/db.server";
import { getDatesForTerm } from "~/services";

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

export type ActionType = "completed" | "remove-complete" | "draft";

export interface SessionCommandRequest {
  type: ActionType;
  studentId: number;
  attendedOn: string;
  report: string;
  studentSessionId: number | null;
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

export async function getReportForSessionDateAsync(
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
        attendedOn,
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
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  return { ...studentSession, session };
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
  studentSessionId: number | null,
  mentorId: number,
  chapterId: number,
  studentId: number,
  attendedOn: string,
  report: string,
) {
  let completedOn: Date | null;
  switch (actionType) {
    case "completed":
      completedOn = new Date();
      break;
    case "draft":
    case "remove-complete":
    default:
      completedOn = null;
      break;
  }

  if (studentSessionId === null) {
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
          },
        },
      },
    });
  }

  return await prisma.studentSession.update({
    where: {
      id: studentSessionId,
    },
    data: {
      report,
      completedOn,
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
