/*eslint-env node*/

import dayjs from "dayjs";

import { subtractMonths } from "./utils.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@achieversclubwa.org.au";
const LOGIC_APP_URL =
  process.env.LOGIC_APP_URL ??
  "https://prod-29.australiaeast.logic.azure.com:443/workflows/76030effd6884117a63dc483c78d2684/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xMW6DZic17YtYjc_aVGQ_xxzJGB6c-irE-gE8L0qLpQ";

export default async function sendWWCCheckReminder(prisma) {
  const today = new Date();
  const threeMonthsAgo = subtractMonths(today, 3);

  const remindersToSend = await prisma.wWCCheck.findMany({
    select: {
      id: true,
      expiryDate: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    where: {
      expiryDate: {
        lte: threeMonthsAgo,
      },
      OR: [
        {
          reminderSentAt: null,
        },
        {
          reminderSentAt: {
            lte: threeMonthsAgo,
          },
        },
      ],
    },
  });

  if (remindersToSend.length === 0) {
    return 0;
  }

  await Promise.all(
    remindersToSend.map(
      async ({ user: { firstName, lastName, email }, expiryDate }) => {
        const expiryDateString = dayjs(expiryDate).format("DD/MM/YYYY");

        const resp = await fetch(LOGIC_APP_URL, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify([
            {
              email,
              content: `
              Hello ${firstName} ${lastName},
              <br />your WWC (Working With Children) check will exipre on: ${expiryDateString}, please renew it.
              <br /><br />Achievers Club WA`,
            },
            {
              email: ADMIN_EMAIL,
              content: `
              ${firstName} ${lastName}'s WWC (Working With Children) check will expire on: ${expiryDateString}.'
              <br />We have sent an email reminder at '${email}'.`,
            },
          ]),
        });

        if (!resp.ok) {
          throw new Error();
        }

        return await resp.text();
      },
    ),
  );

  const counter = await prisma.wWCCheck.updateMany({
    where: {
      id: {
        in: remindersToSend.map(({ id }) => id),
      },
    },
    data: { reminderSentAt: today },
  });

  return counter.count;
}
