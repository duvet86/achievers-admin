import { prisma } from "~/db.server";

export interface SessionCommandRequest {
  sessionId: number;
  report: string;
}

export interface SessionCommand {
  sessionId: number;
  report: string;
  userAzureId: string;
}

export async function getSessionIdAsync(sessionId: number) {
  return await prisma.session.findUniqueOrThrow({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      attendedOn: true,
      report: true,
      signedOffOn: true,
      mentorSession: {
        select: {
          mentor: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
  });
}

export async function saveReportAsync({
  sessionId,
  report,
  userAzureId,
}: SessionCommand) {
  return await prisma.session.update({
    where: {
      id: sessionId,
    },
    data: {
      report,
      completedOn: new Date(),
      writteOnBehalfByAzureId: userAzureId,
    },
  });
}
