import type { MentorToStudentSession } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getSessionByIdAsync(id: MentorToStudentSession["id"]) {
  return await prisma.mentorToStudentSession.findUniqueOrThrow({
    select: {
      id: true,
      attendedOn: true,
      user: {
        select: {
          fullName: true,
        },
      },
      student: {
        select: {
          fullName: true,
        },
      },
    },
    where: {
      id,
    },
  });
}

export async function cancelSessionAsync(sessionId: number, reason: string) {
  return await prisma.mentorToStudentSession.update({
    where: {
      id: sessionId,
    },
    data: {
      isCancelled: true,
      reasonCancelled: reason,
    },
  });
}
