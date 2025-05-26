import type { Term } from "~/models";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { prisma } from "~/db.server";

dayjs.extend(utc);
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

export type ActionType = "completed" | "remove-complete" | "draft";

interface CreateSessionCommand {
  actionType: ActionType;
  chapterId: number;
  mentorId: number;
  studentId: number;
  attendedOn: string;
  report: string;
}

interface UpdateSessionCommand {
  actionType: ActionType;
  sessionId: number;
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
  const studentSession = await prisma.studentSession.findUnique({
    where: {
      chapterId_studentId_attendedOn: {
        chapterId,
        studentId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
    },
    select: {
      id: true,
    },
  });

  if (studentSession === null) {
    return null;
  }

  const mentorSession = await prisma.mentorSession.findUnique({
    where: {
      chapterId_mentorId_attendedOn: {
        chapterId,
        mentorId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
    },
    select: {
      id: true,
    },
  });

  if (mentorSession === null) {
    return null;
  }

  return await prisma.sessionAttendance.findUnique({
    where: {
      chapterId_mentorSessionId_studentSessionId: {
        chapterId,
        mentorSessionId: mentorSession.id,
        studentSessionId: studentSession.id,
      },
    },
    select: {
      id: true,
      report: true,
      completedOn: true,
      signedOffOn: true,
      reportFeedback: true,
      isCancelled: true,
      mentorSession: {
        select: {
          mentorId: true,
          mentor: {
            select: {
              fullName: true,
            },
          },
        },
      },
      studentSession: {
        select: {
          id: true,
        },
      },
    },
  });
}

export async function getSessionDatesFormatted(
  chapterId: number,
  mentorId: number,
  term: Term,
  sessionDates: string[],
) {
  const bookedSessions = await getMentorSessionDatesAsync(
    chapterId,
    mentorId,
    term,
  );

  return sessionDates
    .map((attendedOn) => dayjs(attendedOn))
    .map((attendedOn) => {
      const isBooked = bookedSessions.includes(attendedOn.format("YYYY-MM-DD"));

      return {
        value: attendedOn.toISOString(),
        label: isBooked
          ? `** ${attendedOn.format("DD/MM/YYYY")} (Booked) **`
          : attendedOn.format("DD/MM/YYYY"),
        isBooked,
      };
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

export async function createSessionAsync({
  actionType,
  chapterId,
  mentorId,
  studentId,
  attendedOn,
  report,
}: CreateSessionCommand) {
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

  let mentorSession = await prisma.mentorSession.findUnique({
    where: {
      chapterId_mentorId_attendedOn: {
        chapterId,
        mentorId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (mentorSession !== null && mentorSession.status !== "AVAILABLE") {
    throw new Error("Mentor is not available.");
  }

  let studentSession = await prisma.studentSession.findUnique({
    where: {
      chapterId_studentId_attendedOn: {
        chapterId,
        studentId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (studentSession !== null && studentSession.status !== "AVAILABLE") {
    throw new Error("Student is not available.");
  }

  return await prisma.$transaction(async (tx) => {
    mentorSession ??= await tx.mentorSession.create({
      data: {
        chapterId,
        mentorId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
      select: {
        id: true,
        status: true,
      },
    });

    studentSession ??= await tx.studentSession.create({
      data: {
        chapterId,
        studentId,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
      },
      select: {
        id: true,
        status: true,
      },
    });

    return await tx.sessionAttendance.create({
      data: {
        chapterId,
        studentSessionId: studentSession.id,
        mentorSessionId: mentorSession.id,
        attendedOn: dayjs.utc(attendedOn, "YYYY-MM-DD").toDate(),
        report,
        completedOn,
      },
    });
  });
}

export async function updateSessionAsync({
  actionType,
  sessionId,
  report,
}: UpdateSessionCommand) {
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

  return await prisma.sessionAttendance.update({
    where: {
      id: sessionId,
    },
    data: {
      report,
      completedOn,
    },
  });
}

async function getMentorSessionDatesAsync(
  chapterId: number,
  mentorId: number,
  currentTerm: Term,
) {
  const sessions = await prisma.mentorSession.findMany({
    distinct: "attendedOn",
    where: {
      mentorId,
      chapterId,
      attendedOn: {
        gte: currentTerm.start.toDate(),
        lte: currentTerm.end.toDate(),
      },
    },
    select: {
      attendedOn: true,
    },
  });

  return sessions.map(({ attendedOn }) =>
    dayjs(attendedOn).format("YYYY-MM-DD"),
  );
}
