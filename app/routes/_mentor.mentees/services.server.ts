import type { MentoringMentee } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getMenteesMentoredByIdAsync(
  userId: MentoringMentee["userId"]
) {
  return await prisma.mentoringMentee.findMany({
    where: {
      userId,
    },
    select: {
      Mentee: true,
    },
  });
}
