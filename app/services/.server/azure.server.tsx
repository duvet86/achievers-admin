import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { getTokenInfoAsync } from "./session.server";

export const MICROSOFT_GRAPH_V1_BASEURL = "https://graph.microsoft.com/v1.0";
export const APP_ID = "35499ecd-d259-4e81-9a12-e503a69b91b1";
export const ACHIEVERS_DOMAIN = "achieversclubwa.org.au";

const IS_DEV = process.env.NODE_ENV === "development";

export const ROLES = {
  Admin: IS_DEV
    ? "f1f43596-ed2b-4044-8979-dd78ec6ebe08"
    : "e567add0-fec3-4c87-941a-05dd2e18cdfd",
  Mentor: IS_DEV
    ? "83c9c558-9bbb-498d-8082-fc9dc1884618"
    : "a2ed7b54-4379-465d-873d-2e182e0bd8ef",
} as const;

interface AppRoleAssignment {
  id: string;
  appRoleId: string;
  principalDisplayName: string;
  principalId: string;
  resourceDisplayName: string;
}

interface AzureError {
  error: {
    code: string;
    message: string;
    innerError: {
      date: string;
      "request-id": string;
      "client-request-id": string;
    };
  };
}

interface AzureUserWithRole extends AzureUser {
  appRoleAssignments: AppRoleAssignmentWithRoleName[];
}

interface AzureUser {
  id: string;
  displayName: string;
  givenName: string | null;
  surname: string | null;
  mail: string | null;
  userPrincipalName: string;
  appRoleAssignments: AppRoleAssignment[];
}

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
      },
    ];
    customizedMessageBody: string | null;
  };
  inviteRedirectUrl: string;
  status: string;
  invitedUser: { id: string };
}

export interface AppRoleAssignmentWithRoleName extends AppRoleAssignment {
  roleName: string;
}

export interface AzureUserWebApp extends AzureUser {
  email: string;
}

export interface AzureUserWebAppWithRole extends AzureUserWebApp {
  appRoleAssignments: AppRoleAssignmentWithRoleName[];
}

export interface AppRole {
  id: string;
  displayName: string;
  description: string | null;
}

export interface Application {
  id: string;
  appId: string;
  displayName: string;
  description: string | null;
  appRoles: AppRole[];
}

export interface AzureAppRoleRequest {
  principalId: string;
  resourceId: string;
  appRoleId: string;
}

export interface AzureAppRoleResponse {
  id: string;
  deletedDateTime: string;
  appRoleId: string;
  createdDateTime: string;
  principalDisplayName: string;
  principalId: string;
  principalType: string;
  resourceDisplayName: string;
  resourceId: string;
}

export type AzureRolesLookUp = Record<string, AppRole>;

export async function getAzureRolesAsync(request: Request): Promise<AppRole[]> {
  invariant(process.env.OBJECT_ID, "OBJECT_ID must be set");

  const tokenInfo = await getTokenInfoAsync(request);

  const response = await fetch(
    `${MICROSOFT_GRAPH_V1_BASEURL}/applications/${process.env.OBJECT_ID}?$select=appRoles`,
    {
      headers: getHeaders(tokenInfo.accessToken),
    },
  );

  const azureApplication: Application = await response.json();

  return azureApplication.appRoles;
}

async function getAzureRolesLookUpAsync(
  request: Request,
): Promise<AzureRolesLookUp> {
  const appRoles = await getAzureRolesAsync(request);

  const azureRolesLookUp = appRoles.reduce<AzureRolesLookUp>((res, value) => {
    res[value.id] = value;

    return res;
  }, {});

  return azureRolesLookUp;
}

export async function getAzureUsersAsync(
  request: Request,
  azureIds?: string[],
): Promise<AzureUserWebApp[]> {
  if (azureIds && azureIds.length === 0) {
    return [];
  }

  const tokenInfo = await getTokenInfoAsync(request);

  const filter =
    azureIds && azureIds.length > 0
      ? `&$filter=id in (${azureIds.map((id) => `'${id}'`).join(", ")})`
      : "";

  const response = await fetch(
    `${MICROSOFT_GRAPH_V1_BASEURL}/users?$expand=appRoleAssignments` + filter,
    {
      headers: getHeaders(tokenInfo.accessToken),
    },
  );

  const azureUsers: { value: AzureUser[] } = await response.json();

  return azureUsers.value.map((user) => ({
    ...user,
    email: user.mail ?? user.userPrincipalName,
  }));
}

export async function getAzureUsersWithRolesAsync(
  request: Request,
  azureIds?: string[],
): Promise<AzureUserWebAppWithRole[]> {
  const [azureUsers, roles] = await Promise.all([
    getAzureUsersAsync(request, azureIds),
    getAzureRolesLookUpAsync(request),
  ]);

  return azureUsers.map((user) => ({
    ...user,
    email: user.mail ?? user.userPrincipalName,
    appRoleAssignments: user.appRoleAssignments
      .filter(({ appRoleId }) => roles[appRoleId])
      .map((roleAssignment) => ({
        ...roleAssignment,
        roleName: roles[roleAssignment.appRoleId].displayName,
      })),
  }));
}

async function getAzureUserByIdAsync(
  request: Request,
  azureId: string,
): Promise<AzureUserWithRole> {
  const tokenInfo = await getTokenInfoAsync(request);

  const response = await fetch(
    `${MICROSOFT_GRAPH_V1_BASEURL}/users/${azureId}?$expand=appRoleAssignments`,
    {
      headers: getHeaders(tokenInfo.accessToken),
    },
  );

  const azureUser = await response.json();

  if (
    (azureUser as AzureError).error &&
    (azureUser as AzureError).error.code === "Authorization_RequestDenied"
  ) {
    throw redirect("/401");
  }

  return azureUser;
}

export async function getAzureUserWithRolesByIdAsync(
  request: Request,
  azureId: string,
): Promise<AzureUserWebAppWithRole> {
  const [azureUser, roles] = await Promise.all([
    getAzureUserByIdAsync(request, azureId),
    getAzureRolesLookUpAsync(request),
  ]);

  return {
    ...azureUser,
    email: azureUser.mail ?? azureUser.userPrincipalName,
    appRoleAssignments: azureUser.appRoleAssignments
      .filter(({ appRoleId }) => roles[appRoleId])
      .map((roleAssignment) => ({
        ...roleAssignment,
        roleName: roles[roleAssignment.appRoleId].displayName,
      })),
  };
}

export async function inviteUserToAzureAsync(
  request: Request,
  azureInviteRequest: AzureInviteRequest,
): Promise<AzureInviteResponse> {
  const tokenInfo = await getTokenInfoAsync(request);

  const response = await fetch(`${MICROSOFT_GRAPH_V1_BASEURL}/invitations`, {
    method: "POST",
    headers: getHeaders(tokenInfo.accessToken),
    body: JSON.stringify(azureInviteRequest),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function assignRoleToUserAsync(
  request: Request,
  azureId: string,
  azureAppRoleRequest: AzureAppRoleRequest,
): Promise<AzureAppRoleResponse> {
  const tokenInfo = await getTokenInfoAsync(request);

  const response = await fetch(
    `${MICROSOFT_GRAPH_V1_BASEURL}/users/${azureId}/appRoleAssignments`,
    {
      method: "POST",
      headers: getHeaders(tokenInfo.accessToken),
      body: JSON.stringify(azureAppRoleRequest),
    },
  );

  return response.json();
}

export async function removeRoleFromUserAsync(
  request: Request,
  appRoleAssignmentId: string,
): Promise<void> {
  const tokenInfo = await getTokenInfoAsync(request);

  await fetch(
    `${MICROSOFT_GRAPH_V1_BASEURL}/servicePrincipals/${APP_ID}/appRoleAssignedTo/${appRoleAssignmentId}`,
    {
      method: "DELETE",
      headers: getHeaders(tokenInfo.accessToken),
    },
  );
}

function getHeaders(accessToken: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}
