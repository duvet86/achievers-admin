/*eslint-env node*/
import cron from "node-cron";
import { PrismaClient } from "@prisma/client";

import { trackTrace, trackException } from "../server-utils/utils.js";
import sendPoliceCheckReminder from "./police-check-reminder.js";
import sendWWCCheckReminder from "./wwc-check-reminder.js";

cron.schedule(
  "0 0 * * *", // Every day at midnight perth time.
  async () => {
    const prisma = new PrismaClient();

    try {
      trackTrace("Sending police and WWC check reminders.");

      const policeCheckReminderCounter = await sendPoliceCheckReminder(prisma);
      const WWCCheckReminderCounter = await sendWWCCheckReminder(prisma);

      const totRemindersSent =
        policeCheckReminderCounter + WWCCheckReminderCounter;

      trackTrace("Reminders sent: " + totRemindersSent);
    } catch (e) {
      trackException(e);
    } finally {
      await prisma.$disconnect();
    }
  },
  {
    scheduled: true,
    timezone: "Australia/Perth",
  },
);
