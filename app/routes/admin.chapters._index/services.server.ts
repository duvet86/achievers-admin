import { prisma } from "~/db.server";

export async function getChaptersAsync() {
  return await prisma.chapter.findMany();
}
