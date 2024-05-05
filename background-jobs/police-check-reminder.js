/*eslint-env node*/
import dayjs from "dayjs";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const LOGIC_APP_URL = process.env.LOGIC_APP_URL;
const isDev = process.env.NODE_ENV !== "production";

export default async function sendPoliceCheckReminder(prisma) {
  const today = new Date();

  const remindersToSend = await prisma.policeCheck.findMany({
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
            lte: dayjs(today).subtract(1, "month"),
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
          subject: "Police Clearance renewal",
          content: `
              Your police clearance is due to be renewed in the next 3 months. Please see your
              chapter coordinator at your next mentoring session and they will provide you with
              the appropriate form to complete.
              <br />
              Once the renewal has been completed, the Achievers Club will receive a copy of the
              clearance and will update the details in our records for you.
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
