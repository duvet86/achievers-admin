import type { AppAbility } from "~/services/.server";

import { prisma } from "~/db.server";
import { accessibleBy } from "~/casl-prisma";

export async function getChaptersAsync(ability: AppAbility) {
  return await prisma.chapter.findMany({
    where: accessibleBy(ability).Chapter,
  });
}
