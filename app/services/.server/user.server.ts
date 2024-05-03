import { redirect } from "@remix-run/node";

import { prisma } from "~/db.server";

export async function getUserByAzureADIdAsync(azureADId: string) {
  const user = await prisma.user.findUnique({
    where: {
      azureADId,
    },
  });

  if (user === null) {
    throw redirect("/401");
  }

  return user;
}
