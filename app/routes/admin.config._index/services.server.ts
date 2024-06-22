import { prisma } from "~/db.server";
import { runJobsAsync } from "~/services/.server";

export async function sendEmailRemaniders() {
  return await runJobsAsync(prisma);
}
