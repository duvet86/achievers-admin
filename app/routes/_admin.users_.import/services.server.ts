import type { SpeadsheetUser } from "~/models/speadsheet";
import type { Prisma } from "@prisma/client";

import { Readable } from "stream";

import { stream, read, utils } from "xlsx";
import { getHeaders, MICROSOFT_GRAPH_V1_BASEURL } from "~/services";
import { prisma } from "~/db.server";

export interface AzureInviteRequest {
  invitedUserEmailAddress: string;
  inviteRedirectUrl: string;
  sendInvitationMessage: boolean;
}

export interface AzureInviteResponse {
  id: string;
  inviteRedeemUrl: string;
  invitedUserDisplayName: string;
  invitedUserEmailAddress: string;
  resetRedemption: boolean;
  sendInvitationMessage: boolean;
  invitedUserMessageInfo: {
    messageLanguage: string | null;
    ccRecipients: [
      {
        emailAddress: {
          name: string | null;
          address: string | null;
        };
      }
    ];
    customizedMessageBody: string | null;
  };
  inviteRedirectUrl: string;
  status: string;
  invitedUser: { id: string };
}

export async function readExcelFileAsync(file: File) {
  stream.set_readable(Readable);

  const workbook = read(await file.arrayBuffer());
  const firstWs = workbook.Sheets[workbook.SheetNames[0]];

  const sheetUsers = utils.sheet_to_json<SpeadsheetUser>(firstWs);

  return sheetUsers;
}

export async function inviteUserToAzureAsync(
  accessToken: string,
  azureInviteRequest: AzureInviteRequest
): Promise<AzureInviteResponse> {
  const response = await fetch(`${MICROSOFT_GRAPH_V1_BASEURL}/invitations`, {
    method: "POST",
    headers: getHeaders(accessToken),
    body: JSON.stringify(azureInviteRequest),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function createManyUsersAsync(data: Prisma.UserCreateManyInput[]) {
  return await prisma.user.createMany({
    data,
  });
}

export async function getChaptersAsync() {
  return await prisma.chapter.findMany({
    select: {
      id: true,
      name: true,
    },
  });
}
