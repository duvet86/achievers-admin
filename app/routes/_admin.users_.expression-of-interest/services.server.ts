import { prisma } from "~/db.server";

export async function getEOIUsersAsync() {
  return await prisma.userEOIForm.findMany();
}
