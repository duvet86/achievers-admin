import type { UserEOIForm } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getEOIUserByIdAsync(id: UserEOIForm["id"]) {
  return await prisma.userEOIForm.findUniqueOrThrow({
    where: {
      id,
    },
  });
}
