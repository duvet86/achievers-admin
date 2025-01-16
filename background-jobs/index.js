/*eslint-env node*/
import cron from "node-cron";
import { PrismaClient } from "@prisma/client/index.js";

import { trackEvent, trackException } from "../server-utils/azure-logger.js";
import sendPoliceCheckReminder from "./police-check-reminder.js";
import sendWWCCheckReminder from "./wwc-check-reminder.js";

export async function runJobsAsync(prisma) {
  try {
    trackEvent("EMAIL_REMINDERS_SENT_START");

    const policeCheckReminderCounter = await sendPoliceCheckReminder(prisma);
    const WWCCheckReminderCounter = await sendWWCCheckReminder(prisma);

    const totRemindersSent =
      policeCheckReminderCounter + WWCCheckReminderCounter;

    trackEvent("EMAIL_REMINDERS_SENT_START_END " + totRemindersSent);

    return totRemindersSent;
  } catch (e) {
    trackException(e);
  } finally {
    await prisma.$disconnect();
  }
}

cron.schedule(
  "0 0 * * *", // Every day at midnight perth time.
  async () => {
    const prisma = new PrismaClient();

    await runJobsAsync(prisma);
  },
  {
    scheduled: true,
    timezone: "Australia/Perth",
  },
);
