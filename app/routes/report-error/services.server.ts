import { prisma } from "~/db.server";

interface SupportRequestCommand {
  azureId: string;
  userId?: number;
  email?: string;
  description: string;
  attachments: { name: string; content: string }[];
}

export async function getUserByAzureADIdAsync(azureADId: string) {
  return await prisma.user.findUnique({
    where: {
      azureADId,
    },
    select: {
      id: true,
      email: true,
    },
  });
}

export async function submitSupportRequestAsync(
  supportRequest: SupportRequestCommand,
) {
  const REPORT_ERROR_PATH = process.env.REPORT_ERROR_PATH;
  if (REPORT_ERROR_PATH === undefined) {
    throw new Error("Missing REPORT_ERROR_PATH");
  }

  const resp = await fetch(REPORT_ERROR_PATH, {
    method: "POST",
    body: JSON.stringify(supportRequest),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (resp.status !== 202) {
    throw new Error(`Logic app status: ${resp.status}`);
  }
}
