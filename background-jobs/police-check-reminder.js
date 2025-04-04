/*eslint-env node*/
import fs from "node:fs/promises";
import path from "path";

import dayjs from "dayjs";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const REMAINDER_LOGIC_APP_URL = process.env.REMAINDER_LOGIC_APP_URL;
const IS_DEV = process.env.NODE_ENV !== "production";

const filePath = path.join(process.cwd(), "public/VNPC Consent Form.pdf");

export async function sendPoliceCheckReminder2Months(prisma) {
  const today = new Date();

  const remindersToSend = await prisma.policeCheck.findMany({
    select: {
      id: true,
      user: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
    where: {
      AND: {
        user: {
          endDate: null,
        },
        expiryDate: {
          lte: dayjs(today).add(2, "months"), // 2 months before.
        },
        reminderSentAt: null,
      },
    },
  });

  if (remindersToSend.length === 0) {
    return 0;
  }

  const attachment = await fs.readFile(filePath, { encoding: "base64" });

  await Promise.all(
    remindersToSend.map(async ({ user: { fullName, email } }) =>
      fetch(REMAINDER_LOGIC_APP_URL, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: IS_DEV ? ADMIN_EMAIL : email,
          subject: `Reminder phone call required for ${fullName}'s police clearance renewal`,
          content: `
              ${fullName}'s police clearance will expire in three weeks. Please check if an application to
              renew the police clearance has been made.
              <br />
              If there has been no action taken then please call the volunteer and ask them to complete the
              attached form as soon as possible to start the renewal process.
              <br />
              Many thanks,
              Achievers Club WA Admin`,
          attachment,
        }),
      }),
    ),
  );

  return await setReminderSentAt(prisma, remindersToSend, today);
}

export async function sendPoliceCheckReminder1Months(prisma) {
  const today = new Date();

  const remindersToSend = await prisma.policeCheck.findMany({
    select: {
      id: true,
      user: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
    where: {
      AND: {
        user: {
          endDate: null,
        },
        expiryDate: {
          lte: dayjs(today).add(1, "months"), // 1 month before.
        },

        reminderSentAt: {
          lte: dayjs(today).subtract(1, "month"),
        },
      },
    },
  });

  if (remindersToSend.length === 0) {
    return 0;
  }

  const attachment = await fs.readFile(filePath, { encoding: "base64" });

  await Promise.all(
    remindersToSend.map(async ({ user: { email } }) =>
      fetch(REMAINDER_LOGIC_APP_URL, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: IS_DEV ? ADMIN_EMAIL : email,
          subject: "Your Police Clearance is Due for Renewal",
          content: `
              Your police clearance is <span style="font-weight: bold;">due to be renewed within the next month</span>. Please complete the
              attached form and email it to <span style="text-decoration: underline;">admin@achieversclubwa.org.au</span> at your earliest convenience. If
              you are unable to print this form or would like to receive a paper copy please speak to your
              chapter coordinator who can provide one for you.
              <br />
              Once the renewal has been completed both yourself and the Achievers Club will receive an
              electronic copy of the clearance via email and text message. We will update the details in our
              records for you.
              <br />
              Many thanks,
              Achievers Club WA Admin`,
          attachment,
        }),
      }),
    ),
  );

  return await setReminderSentAt(prisma, remindersToSend, today);
}

export async function sendPoliceCheckReminder3Weeks(prisma) {
  const today = new Date();

  const remindersToSend = await prisma.policeCheck.findMany({
    select: {
      id: true,
      user: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
    where: {
      AND: {
        user: {
          endDate: null,
        },
        expiryDate: {
          lte: dayjs(today).add(3, "weeks"), // 3 weeks before.
        },
        reminderSentAt: {
          lte: dayjs(today).subtract(3, "weeks"),
        },
      },
    },
  });

  if (remindersToSend.length === 0) {
    return 0;
  }

  const attachment = await fs.readFile(filePath, { encoding: "base64" });

  await Promise.all(
    remindersToSend.map(async ({ user: { email } }) =>
      fetch(REMAINDER_LOGIC_APP_URL, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: IS_DEV ? ADMIN_EMAIL : email,
          subject: "Your Police Clearance is Due for Renewal",
          content: `
              Your police clearance is <span style="font-weight: bold;">due to be renewed within the next month</span>. Please complete the
              attached form and email it to <span style="text-decoration: underline;">admin@achieversclubwa.org.au</span> at your earliest convenience. If
              you are unable to print this form or would like to receive a paper copy please speak to your
              chapter coordinator who can provide one for you.
              <br />
              Once the renewal has been completed both yourself and the Achievers Club will receive an
              electronic copy of the clearance via email and text message. We will update the details in our
              records for you.
              <br />
              Many thanks,
              Achievers Club WA Admin`,
          attachment,
        }),
      }),
    ),
  );

  return await setReminderSentAt(prisma, remindersToSend, today);
}

async function setReminderSentAt(prisma, remindersToSend, today) {
  const counter = await prisma.policeCheck.updateMany({
    where: {
      id: {
        in: remindersToSend.map(({ id }) => id),
      },
    },
    data: { reminderSentAt: today },
  });

  return counter.count;
}
