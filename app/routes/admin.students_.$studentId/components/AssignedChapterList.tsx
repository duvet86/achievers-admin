import type { SerializeFrom } from "@remix-run/node";
import type { loader } from "../index";

import { Link } from "@remix-run/react";

import { GraduationCap, Xmark } from "iconoir-react";
import { SubTitle } from "~/components";

interface Props {
  loaderData: SerializeFrom<typeof loader>;
}

export function AssignedChapterList({ loaderData: { student } }: Props) {
  return (
    <>
      <SubTitle>Chapter</SubTitle>

      <div className="overflow-auto bg-white">
        <table className="table">
          <thead>
            <tr>
              <th align="left" className="p-2">
                Chapters
              </th>
              <th align="right" className="w-56 p-2">
                Chapter action
              </th>
            </tr>
          </thead>
          <tbody>
            {student.studentAtChapter.map(({ chapterId, chapter }) => (
              <tr key={chapterId}>
                <td className="border p-2">{chapter.name}</td>
                <td className="border p-2">
                  <div className="join w-full">
                    <Link
                      className="btn btn-error join-item btn-xs w-full gap-2"
                      to={`chapters/${chapterId}/remove`}
                    >
                      <Xmark className="h-4 w-4" />
                      <span className="hidden lg:block">Remove</span>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {!student.studentAtChapter && (
              <tr>
                <td colSpan={3} className="border p-2">
                  <i>This student is not assigned to a chapter</i>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <Link
          to={
            "chapters/" +
            (student.studentAtChapter.length
              ? student.studentAtChapter[0]?.chapterId.toString()
              : "new")
          }
          className="btn btn-primary w-64 gap-4"
        >
          <GraduationCap className="h-6 w-6" />
          {student.studentAtChapter.length ? "Edit chapter" : "Add a chapter"}
        </Link>
      </div>
    </>
  );
}
