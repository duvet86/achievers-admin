import { redirect } from "react-router";
import invariant from "tiny-invariant";

import { trackEvent, trackException } from "~/services/.server";

import { getTokenInfoAsync } from "./session.server";

const IS_DEV = process.env.NODE_ENV === "development";
const IS_CI = !!process.env.CI;

export const MICROSOFT_GRAPH_V1_BASEURL = "https://graph.microsoft.com/v1.0";
export const APP_ID =
  IS_DEV || IS_CI
    ? "e8a824bf-49a5-4104-aeaa-43d9b31cc1e2"
    : "35499ecd-d259-4e81-9a12-e503a69b91b1";
export const ACHIEVERS_DOMAIN = "achieversclubwa.org.au";

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

  if (IS_DEV && new Date(tokenInfo.expiresOn) < new Date()) {
    throw redirect("/logout");
  }

  const response = await fetch(
    `${MICROSOFT_GRAPH_V1_BASEURL}/applications/${process.env.OBJECT_ID}?$select=appRoles`,
    {
      headers: getHeaders(tokenInfo.accessToken),
    },
  );

  const azureApplication = (await response.json()) as Application;

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

  const azureUsers = (await response.json()) as { value: AzureUser[] };

  return azureUsers.value.map((user) => ({
    ...user,
    email: user.mail ?? user.userPrincipalName,
  }));
}

export async function getAzureUserByAzureEmailAsync(
  request: Request,
  email: string,
): Promise<AzureUser> {
  const tokenInfo = await getTokenInfoAsync(request);

  const response = await fetch(`${MICROSOFT_GRAPH_V1_BASEURL}/users/${email}`, {
    headers: getHeaders(tokenInfo.accessToken),
  });

  const azureUser = (await response.json()) as AzureUser;

  return azureUser;
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

  const azureUser: unknown = await response.json();

  if (
    (azureUser as AzureError).error &&
    (azureUser as AzureError).error.code === "Authorization_RequestDenied"
  ) {
    trackException(new Error((azureUser as AzureError).error.message));
    throw redirect("/403");
  }
  if (
    (azureUser as AzureError).error &&
    (azureUser as AzureError).error.code === "Request_ResourceNotFound"
  ) {
    trackException(new Error((azureUser as AzureError).error.message));
    throw redirect("/404");
  }

  return azureUser as AzureUserWithRole;
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
    const textError = await response.text();

    trackException(new Error(textError));

    throw (JSON.parse(textError) as { error: string }).error;
  }

  return (await response.json()) as AzureInviteResponse;
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

  if (!response.ok) {
    const textError = await response.text();

    trackException(new Error(textError));

    throw (JSON.parse(textError) as { error: string }).error;
  }

  return (await response.json()) as AzureAppRoleResponse;
}

export async function deleteAzureUserAsync(
  request: Request,
  id: string,
): Promise<void> {
  const tokenInfo = await getTokenInfoAsync(request);

  const response = await fetch(`${MICROSOFT_GRAPH_V1_BASEURL}/users/${id}`, {
    method: "DELETE",
    headers: getHeaders(tokenInfo.accessToken),
  });

  if (!response.ok) {
    const textError = await response.text();

    trackException(new Error(textError));

    throw (JSON.parse(textError) as { error: string }).error;
  }

  trackEvent("DELETE_AZURE_USER");
}

function getHeaders(accessToken: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}
