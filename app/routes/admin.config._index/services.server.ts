import { prisma } from "~/db.server";
import { runJobsAsync } from "~/services/.server";

export async function sendEmailRemaniders(): Promise<void> {
  return await runJobsAsync(prisma) as void;
}
