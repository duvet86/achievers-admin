import type { MentoringMentee } from "@prisma/client";

import { prisma } from "~/db.server";

export async function unassignMenteeFromMentorAsync(
  userId: MentoringMentee["userId"],
  menteeId: MentoringMentee["menteeId"],
  chapterId: MentoringMentee["chapterId"]
) {
  await prisma.mentoringMentee.delete({
    where: {
      userId_menteeId_chapterId: {
        chapterId,
        userId,
        menteeId,
      },
    },
  });
}
