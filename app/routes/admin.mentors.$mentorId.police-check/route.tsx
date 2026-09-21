import type { Route } from "./+types/route";

import { useFetcher } from "react-router";
import classNames from "classnames";
import dayjs from "dayjs";
import { Bin, Download, PageEdit, Plus } from "iconoir-react";
import invariant from "tiny-invariant";

import { StateLink, Title } from "~/components";

import {
  deletePoliceCheckAsync,
  getFileUrl,
  getUserByIdAsync,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.mentorId, "mentorId not found");

  const user = await getUserByIdAsync(Number(params.mentorId));

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
    },
    // Ordered from the current check to the oldest one.
    checks: user.policeCheck.map(
      ({ id, applicationNumber, expiryDate, createdAt, filePath }) => ({
        id,
        applicationNumber,
        expiryDate,
        createdAt,
        fileUrl: filePath ? getFileUrl(filePath) : null,
      }),
    ),
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.mentorId, "mentorId not found");

  const formData = await request.formData();

  await deletePoliceCheckAsync(Number(formData.get("checkId")));

  return null;
}

function getStatus(expiryDate: Date, isCurrent: boolean) {
  if (!isCurrent) {
    return { label: "Previous", className: "badge-ghost" };
  }

  if (dayjs(expiryDate).isBefore(dayjs(), "day")) {
    return { label: "Expired", className: "badge-error" };
  }

  if (dayjs(expiryDate).isBefore(dayjs().add(3, "months"), "day")) {
    return { label: "Expiring soon", className: "badge-warning" };
  }

  return { label: "Current", className: "badge-success" };
}

export default function Index({
  loaderData: { user, checks },
}: Route.ComponentProps) {
  const { submit } = useFetcher();

  const handleDelete = (checkId: number) => () => {
    if (!confirm("Are you sure you want to delete this police check?")) {
      return;
    }

    void submit({ checkId: checkId.toString() }, { method: "DELETE" });
  };

  return (
    <>
      <Title>Police checks for &quot;{user.fullName}&quot;</Title>

      <a
        href="https://wfv.identityservice.auspost.com.au/wfvselfinvite/wapol/invite-candidate"
        className="link link-info my-4"
        target="_blank"
        rel="noopener noreferrer"
      >
        VNPC Portal
      </a>

      <div className="overflow-auto bg-white">
        <table className="table">
          <thead>
            <tr>
              <th align="left">Application number</th>
              <th align="left">Expiry date</th>
              <th align="left">Added on</th>
              <th align="left">Status</th>
              <th align="center" className="w-1/4">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {checks.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <i>No police checks defined for this user</i>
                </td>
              </tr>
            )}
            {checks.map(
              (
                { id, applicationNumber, expiryDate, createdAt, fileUrl },
                index,
              ) => {
                const status = getStatus(expiryDate, index === 0);

                return (
                  <tr key={id}>
                    <td>{applicationNumber}</td>
                    <td>{dayjs(expiryDate).format("MMMM D, YYYY")}</td>
                    <td>{dayjs(createdAt).format("MMMM D, YYYY")}</td>
                    <td>
                      <span className={classNames("badge", status.className)}>
                        {status.label}
                      </span>
                    </td>
                    <td align="center">
                      <div className="flex w-full gap-2">
                        {fileUrl ? (
                          <a
                            className="btn btn-xs flex-1 gap-2"
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            download
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        ) : (
                          <span className="flex-1" />
                        )}
                        <StateLink
                          className="btn btn-success btn-xs flex-1 gap-2"
                          to={`/admin/mentors/${user.id}/police-check/${id}`}
                        >
                          <PageEdit className="h-4 w-4" />
                          Edit
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
                );
              },
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <StateLink
          className="btn btn-primary mt-4 w-56 gap-4 lg:mt-0"
          to={`/admin/mentors/${user.id}/police-check/new`}
        >
          <Plus className="h-6 w-6" />
          Add police check
        </StateLink>
      </div>
    </>
  );
}
