import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

export const MICROSOFT_GRAPH_V1_BASEURL = "https://graph.microsoft.com/v1.0";
export const APP_ID = "35499ecd-d259-4e81-9a12-e503a69b91b1";
export const WEB_APP_URL = "https://achievers-webapp.azurewebsites.net";
export const ACHIEVERS_DOMAIN = "achieversclubwa.org.au";

export enum Roles {
  Admin = "e567add0-fec3-4c87-941a-05dd2e18cdfd",
  Mentor = "a2ed7b54-4379-465d-873d-2e182e0bd8ef",
}

interface AppRoleAssignment {
  id: string;
  appRoleId: string;
  principalDisplayName: string;
  principalId: string;
  resourceDisplayName: string;
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
      }
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

export type AzureRolesLookUp = Record<string, AppRole>;

export function getHeaders(accessToken: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function getAzureRolesAsync(
  accessToken: string
): Promise<AppRole[]> {
  try {
    invariant(process.env.OBJECT_ID, "OBJECT_ID must be set");

    const response = await fetch(
      `${MICROSOFT_GRAPH_V1_BASEURL}/applications/${process.env.OBJECT_ID}?$select=appRoles`,
      {
        headers: getHeaders(accessToken),
      }
    );

    const azureApplication: Application = await response.json();

    return azureApplication.appRoles;
  } catch (e) {
    throw redirect("/logout");
  }
}

async function getAzureRolesLookUpAsync(
  accessToken: string
): Promise<AzureRolesLookUp> {
  try {
    const appRoles = await getAzureRolesAsync(accessToken);

    const azureRolesLookUp = appRoles.reduce<AzureRolesLookUp>((res, value) => {
      res[value.id] = value;

      return res;
    }, {});

    return azureRolesLookUp;
  } catch (e) {
    throw redirect("/logout");
  }
}

export async function getAzureUsersAsync(
  accessToken: string,
  azureIds?: string[]
): Promise<AzureUserWebApp[]> {
  if (azureIds && azureIds.length === 0) {
    return [];
  }

  const filter =
    azureIds && azureIds.length > 0
      ? `&$filter=id in (${azureIds.map((id) => `'${id}'`).join(", ")})`
      : "";

  try {
    const response = await fetch(
      `${MICROSOFT_GRAPH_V1_BASEURL}/users?$expand=appRoleAssignments` + filter,
      {
        headers: getHeaders(accessToken),
      }
    );

    const azureUsers: { value: AzureUser[] } = await response.json();

    return azureUsers.value.map((user) => ({
      ...user,
      email: user.mail ?? user.userPrincipalName,
    }));
  } catch (e) {
    throw redirect("/logout");
  }
}

export async function getAzureUsersWithRolesAsync(
  accessToken: string,
  azureIds?: string[]
): Promise<AzureUserWebAppWithRole[]> {
  try {
    const [azureUsers, roles] = await Promise.all([
      getAzureUsersAsync(accessToken, azureIds),
      getAzureRolesLookUpAsync(accessToken),
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
  } catch (e) {
    throw redirect("/logout");
  }
}

export async function getAzureUserWithRolesByIdAsync(
  accessToken: string,
  azureId: string
): Promise<AzureUserWebAppWithRole> {
  try {
    const response = await fetch(
      `${MICROSOFT_GRAPH_V1_BASEURL}/users/${azureId}?$expand=appRoleAssignments`,
      {
        headers: getHeaders(accessToken),
      }
    );

    const azureUserPromise: Promise<AzureUserWithRole> = response.json();

    const [azureUser, roles] = await Promise.all([
      azureUserPromise,
      getAzureRolesLookUpAsync(accessToken),
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
  } catch (e) {
    throw redirect("/logout");
  }
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
