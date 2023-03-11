import { redirect } from "@remix-run/node";
import { APP_ID, getHeaders, MICROSOFT_GRAPH_V1_BASEURL } from "~/services";

export async function removeRoleFromUserAsync(
  accessToken: string,
  appRoleAssignmentId: string
): Promise<void> {
  try {
    await fetch(
      `${MICROSOFT_GRAPH_V1_BASEURL}/servicePrincipals/${APP_ID}/appRoleAssignedTo/${appRoleAssignmentId}`,
      {
        method: "DELETE",
        headers: getHeaders(accessToken),
      }
    );
  } catch (e) {
    throw redirect("/logout");
  }
}
