import type { AzureUser } from "./azure.server";

import { prisma } from "~/db.server";

export async function getStudentsMentoredByAsync(mentorId: AzureUser["id"]) {
  return await prisma.mentoringStudent.findMany({
    where: {
      mentorId,
    },
  });
}
