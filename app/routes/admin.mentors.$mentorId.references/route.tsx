import type { Route } from "./+types/route";

import { useFetcher } from "react-router";
import invariant from "tiny-invariant";
import {
  Bin,
  ChatBubbleEmpty,
  Check,
  Plus,
  WarningTriangle,
  Xmark,
} from "iconoir-react";

import { StateLink, Title } from "~/components";

import { deleteReferenceById, getUserByIdAsync } from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.mentorId, "mentorId not found");

  const user = await getUserByIdAsync(Number(params.mentorId));

  return {
    user,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.mentorId, "mentorId not found");

  const formData = await request.formData();
  const referenceId = formData.get("referenceId")!.toString();

  await deleteReferenceById(Number(referenceId));

  return null;
}

// Checks the isMentorRecommended status. If it is null, it returns a warning triangle icon. If it is true, it returns a check icon. If it is false, it returns a xmark icon.
const renderMentorRecommendationStatus = (
  isMentorRecommended: boolean | null,
) => {
  if (isMentorRecommended === null) {
    return <WarningTriangle className="text-warning h-6 w-6" />;
  } else if (isMentorRecommended) {
    return <Check className="text-success h-6 w-6" />;
  } else {
    return <Xmark className="text-danger h-6 w-6" />;
  }
};

export default function Index({ loaderData: { user } }: Route.ComponentProps) {
  const { submit } = useFetcher();

  const handleDelete = (referenceId: number) => () => {
    if (!confirm("Are you sure you want to delete this reference?")) {
      return;
    }

    void submit(
      {
        referenceId: referenceId.toString(),
      },
      {
        method: "DELETE",
      },
    );
  };

  return (
    <>
      <Title>References for &quot;{user.fullName}&quot;</Title>

      <div className="overflow-auto bg-white">
        <table className="table">
          <thead>
            <tr>
              <th align="center">Full Name</th>
              <th align="center" className="w-1/12">
                Status
              </th>
              <th align="center" className="w-1/4">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {user.references.length === 0 && (
              <tr>
                <td colSpan={3}>
                  <i>No References defined for this user</i>
                </td>
              </tr>
            )}
            {user.references.map(({ id, fullName, isMentorRecommended }) => (
              <tr key={id}>
                <td>{fullName}</td>
                <td align="center">
                  {renderMentorRecommendationStatus(isMentorRecommended)}
                </td>
                <td align="center">
                  <div className="flex w-full gap-2">
                    <StateLink
                      to={`${id}`}
                      className="btn btn-success btn-xs flex-1 gap-2"
                    >
                      <ChatBubbleEmpty className="h-4 w-4" />
                      View
                    </StateLink>
                    <button
                      className="btn btn-error btn-xs flex-1 gap-2"
                      onClick={handleDelete(id)}
                    >
                      <Bin /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <StateLink
          className="btn btn-primary mt-4 w-56 gap-4 lg:mt-0"
          to={`/admin/mentors/${user.id}/references/new`}
        >
          <Plus className="h-6 w-6" />
          Add reference
        </StateLink>
      </div>
    </>
  );
}
