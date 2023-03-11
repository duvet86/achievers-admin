import type { Mentee } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getMenteeById(menteeId: Mentee["id"]) {
  return await prisma.mentee.findUniqueOrThrow({
    where: {
      id: menteeId,
    },
    include: {
      Mentors: true,
    },
  });
}
