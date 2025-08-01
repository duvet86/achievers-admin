import type { Route } from "./+types/route";

import { parseFormData } from "@mjackson/form-data-parser";
import { WarningCircle } from "iconoir-react";

import {
  deleteUserProfilePicture,
  getLoggedUserInfoAsync,
  getUserProfilePictureUrl,
  memoryHandlerDispose,
  saveUserProfilePicture,
  uploadHandler,
} from "~/services/.server";
import { Title } from "~/components";

import { getUserByAzureADIdAsync } from "./services.server";
import { UserForm } from "./components";

export async function loader({ request }: Route.LoaderArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  const profilePicturePath = user?.profilePicturePath
    ? getUserProfilePictureUrl(user.profilePicturePath)
    : null;

  return {
    user: {
      ...user,
      profilePicturePath,
    },
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await parseFormData(request, uploadHandler);

  const userId = formData.get("userId");

  const profilePicure = formData.get("profilePicure");
  if (profilePicure === "DELETE") {
    await deleteUserProfilePicture(Number(userId));
  } else if (profilePicure instanceof File) {
    await saveUserProfilePicture(Number(userId), profilePicure);

    memoryHandlerDispose("profilePicure");
  } else {
    throw new Error();
  }

  return null;
}

export default function Index({ loaderData: { user } }: Route.ComponentProps) {
  return (
    <>
      <div className="flex w-full items-center justify-between gap-8">
        <Title>{user.fullName} profile</Title>

        <button
          className="btn btn-error"
          onClick={() =>
            (
              document.getElementById("report-error-modal") as HTMLDialogElement
            ).showModal()
          }
        >
          <WarningCircle />
          Report error
        </button>
      </div>

      <UserForm user={user} />
    </>
  );
}
