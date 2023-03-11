import { redirect } from "@remix-run/node";
import { APP_ID, getHeaders, MICROSOFT_GRAPH_V1_BASEURL } from "~/services";

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

export async function assignRoleToUserAsync(
  accessToken: string,
  azureAppRoleRequest: AzureAppRoleRequest
): Promise<AzureAppRoleResponse> {
  try {
    const response = await fetch(
      `${MICROSOFT_GRAPH_V1_BASEURL}/servicePrincipals/${APP_ID}/appRoleAssignedTo`,
      {
        method: "POST",
        headers: getHeaders(accessToken),
        body: JSON.stringify(azureAppRoleRequest),
      }
    );

    return response.json();
  } catch (e) {
    throw redirect("/logout");
  }
}
