import type { Prisma } from "@prisma/client";

import { prisma } from "~/db.server";

export async function createNewMentee(
  newMentee: Prisma.XOR<
    Prisma.MenteeCreateInput,
    Prisma.MenteeUncheckedCreateInput
  >
) {
  return await prisma.mentee.create({
    data: newMentee,
  });
}
