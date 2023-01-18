import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

export enum Roles {
  Admin = "e567add0-fec3-4c87-941a-05dd2e18cdfd",
  Mentor = "a2ed7b54-4379-465d-873d-2e182e0bd8ef",
  Student = "ee1650fe-387b-40c3-bb73-e8d54fbe09a6",
}

export interface AppRoleAssignment {
  id: string;
  appRoleId: string;
  principalDisplayName: string;
  principalId: string;
  resourceDisplayName: string;
}

export interface AppRoleAssignmentWithRoleName extends AppRoleAssignment {
  roleName: string;
}

export interface AzureUser {
  id: string;
  displayName: string;
  givenName: string | null;
  surname: string | null;
  mail: string | null;
  userPrincipalName: string;
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

export async function getAzureRolesLookUpAsync(): Promise<AzureRolesLookUp> {
  invariant(process.env.CLIENT_ID, "CLIENT_ID must be set");

  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/applications/${process.env.CLIENT_ID}?$select=appRoles`,
      {
        headers: {
          Authorization: `Bearer ${global.__accessToken__}`,
        },
      }
    );

    const azureApplication: Application = await response.json();

    const azureRolesLookUp = azureApplication.appRoles.reduce<AzureRolesLookUp>(
      (res, value) => {
        res[value.id] = value;

        return res;
      },
      {}
    );

    return azureRolesLookUp;
  } catch (e) {
    throw redirect("/logout");
  }
}

export async function getAzureUsersAsync(): Promise<AzureUser[]> {
  try {
    const response = await fetch(
      "https://graph.microsoft.com/v1.0/users?$expand=appRoleAssignments",
      {
        headers: {
          Authorization: `Bearer ${global.__accessToken__}`,
        },
      }
    );

    const azureUsersPromise: Promise<{ value: AzureUser[] }> = response.json();

    const [azureUsers, roles] = await Promise.all([
      azureUsersPromise,
      getAzureRolesLookUpAsync(),
    ]);

    return azureUsers.value.map((user) => ({
      ...user,
      appRoleAssignments: user.appRoleAssignments.map((roleAssignment) => ({
        ...roleAssignment,
        roleName: roles[roleAssignment.appRoleId].displayName,
      })),
    }));
  } catch (e) {
    throw redirect("/logout");
  }
}

export async function getAzureUserByIdAsync(
  azureId: string
): Promise<AzureUser> {
  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${azureId}?$expand=appRoleAssignments`,
      {
        headers: {
          Authorization: `Bearer ${global.__accessToken__}`,
        },
      }
    );

    const azureUserPromise: Promise<AzureUser> = response.json();

    const [azureUser, roles] = await Promise.all([
      azureUserPromise,
      getAzureRolesLookUpAsync(),
    ]);

    return {
      ...azureUser,
      appRoleAssignments: azureUser.appRoleAssignments.map(
        (roleAssignment) => ({
          ...roleAssignment,
          roleName: roles[roleAssignment.appRoleId].displayName,
        })
      ),
    };
  } catch (e) {
    throw redirect("/logout");
  }
}
