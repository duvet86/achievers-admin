import type { SerializeFrom } from "@remix-run/node";
import type { loader } from "../index";

import { Link } from "@remix-run/react";

import { Xmark, HomeSimpleDoor } from "iconoir-react";

interface Props {
  loaderData: SerializeFrom<typeof loader>;
}

export function AssignedChapterList({ loaderData: { user } }: Props) {
  return (
    <>
      <div className="overflow-auto bg-white">
        <table className="table">
          <thead>
            <tr>
              <th align="left" className="p-2">
                Chapters
              </th>
              <th align="right" className="w-3/12 p-2">
                Chapters action
              </th>
            </tr>
          </thead>
          <tbody>
            {user.userAtChapter.map(({ chapter }) => (
              <tr key={chapter.id}>
                <td className="border p-2">
                  <Link
                    to={`/admin/chapters/${chapter.id}`}
                    className="link font-semibold"
                  >
                    {chapter.name}
                  </Link>
                </td>
                <td align="right" className="border p-2">
                  <Link
                    to={`chapters/${chapter.id}/delete`}
                    className="btn btn-error btn-xs w-full gap-2"
                  >
                    <Xmark className="h-4 w-4" />
                    Remove
                  </Link>
                </td>
              </tr>
            ))}
            {user.userAtChapter.length === 0 && (
              <tr>
                <td colSpan={2} className="border p-2">
                  <i>No chapters assigned to this user</i>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <Link to="chapters/assign" className="btn btn-primary w-64 gap-4">
          <HomeSimpleDoor className="h-6 w-6" />
          Assign a chapter
        </Link>
      </div>
    </>
  );
}
