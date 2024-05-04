/*eslint-env node*/
import dayjs from "dayjs";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const LOGIC_APP_URL = process.env.LOGIC_APP_URL;
const isDev = process.env.NODE_ENV !== "production";

export default async function sendWWCCheckReminder(prisma) {
  const today = new Date();

  const remindersToSend = await prisma.wWCCheck.findMany({
    select: {
      id: true,
      user: {
        select: {
          email: true,
        },
      },
    },
    where: {
      user: {
        endDate: {
          not: null,
        },
      },
      expiryDate: {
        lte: dayjs(today).add(3, "months"),
      },
      OR: [
        {
          reminderSentAt: null,
        },
        {
          reminderSentAt: {
            lte: dayjs(today).add(1, "month"),
          },
        },
      ],
    },
  });

  if (remindersToSend.length === 0) {
    return 0;
  }

  await Promise.all(
    remindersToSend.map(async ({ user: { email } }) => {
      const resp = await fetch(LOGIC_APP_URL, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: isDev ? ADMIN_EMAIL : email,
          subject: "Working with children check renewal",
          content: `
          Your working with children check is due to be renewed in the next 3 months. You can
          do this online by logging into your WWC account or registering for an account if you
          don't already have one: https://www.workingwithchildren.wa.gov.au/online-services
          <br />
          Once this has been renewed, please provide us with the new expiry date. If you need
          any help, please don't hesitate to contact ${ADMIN_EMAIL}.
          <br /><br />
          Many thanks,
          Achievers Club WA`,
        }),
      });

      if (!resp.ok) {
        throw new Error();
      }

      return await resp.text();
    }),
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
