/*eslint-env node*/
import cron from "node-cron";
import { PrismaClient } from "@prisma/client/index.js";

import { trackEvent, trackException } from "../server-utils/azure-logger.js";
import {
  sendPoliceCheckReminder2Months,
  sendPoliceCheckReminder1Months,
  sendPoliceCheckReminder3Weeks,
} from "./police-check-reminder.js";
import sendWWCCheckReminder from "./wwc-check-reminder.js";

export async function runJobsAsync(prisma) {
  try {
    trackEvent("EMAIL_REMINDERS_SENT_START");

    const policeCheckReminder2MonthsCounter =
      await sendPoliceCheckReminder2Months(prisma);
    const policeCheckReminder1MonthsCounter =
      await sendPoliceCheckReminder1Months(prisma);
    const policeCheckReminder3WeeksCounter =
      await sendPoliceCheckReminder3Weeks(prisma);

    const WWCCheckReminderCounter = await sendWWCCheckReminder(prisma);

    const totRemindersSent =
      policeCheckReminder2MonthsCounter +
      policeCheckReminder1MonthsCounter +
      policeCheckReminder3WeeksCounter +
      WWCCheckReminderCounter;

    trackEvent("EMAIL_REMINDERS_SENT_COUNTER=" + totRemindersSent);
    trackEvent("EMAIL_REMINDERS_SENT_START_END");

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
