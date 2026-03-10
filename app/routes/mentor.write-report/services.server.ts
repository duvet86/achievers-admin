import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { prisma } from "~/db.server";

dayjs.extend(utc);
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

export type ActionType =
  | "completed"
  | "remove-complete"
  | "remove-cancelled"
  | "draft";

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
  return await prisma.mentor.findUniqueOrThrow({
    where: {
      azureADId,
      endDate: null,
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
      student: {
        endDate: null,
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
      mentor: {
        endDate: null,
      },
    },
    select: {
      id: true,
    },
  });

  if (mentorSession === null) {
    return null;
  }

  return await prisma.session.findUnique({
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
      cancelledReasonId: true,
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

export async function getStudentsAsync(mentorId: number, chapterId: number) {
  const assignedStudents = await prisma.mentorToStudentAssignement.findMany({
    where: {
      mentorId,
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
          mentorId,
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
      completedOn = null;
      break;
    default:
      throw new Error("Invalid action type.");
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

    return await tx.session.create({
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
  switch (actionType) {
    case "completed":
      return await prisma.session.update({
        where: {
          id: sessionId,
        },
        data: {
          report,
          completedOn: new Date(),
        },
      });
    case "draft":
    case "remove-complete":
    default:
      return await prisma.session.update({
        where: {
          id: sessionId,
        },
        data: {
          report,
          completedOn: null,
        },
      });
    case "remove-cancelled":
      return await prisma.session.update({
        where: {
          id: sessionId,
        },
        data: {
          completedOn: null,
          cancelledAt: null,
          cancelledReasonId: null,
          cancelledBecauseOf: null,
        },
      });
  }
}

export async function getCancelReasons() {
  return await prisma.sessionCancelledReason.findMany({
    select: {
      id: true,
      reason: true,
    },
  });
}

export function isSessionDateInTheFutureServer(attendedOn: string) {
  return (
    dayjs.utc(attendedOn) >
    dayjs.utc(dayjs().format("YYYY-MM-DD") + "T00:00:00.000Z")
  );
}
