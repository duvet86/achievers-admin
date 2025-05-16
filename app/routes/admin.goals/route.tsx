import type { Route } from "./+types/route";

import { Form, useSearchParams, useSubmit } from "react-router";

import { useRef } from "react";
import { Check, Eye, Xmark } from "iconoir-react";
import dayjs from "dayjs";

import {
  getLoggedUserInfoAsync,
  getPermissionsAbility,
} from "~/services/.server";
import { getPaginationRange } from "~/services";
import {
  Pagination,
  Select,
  SelectSearch,
  StateLink,
  Title,
} from "~/components";

import {
  getCountAsync,
  getStudentGoalsAsync,
  getChaptersAsync,
  getAvailabelMentorsAsync,
  getAvailabelStudentsAsync,
} from "./services.server";

export async function loader({ request }: Route.LoaderArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const ability = getPermissionsAbility(loggedUser.roles);

  const url = new URL(request.url);

  const searchTermSubmit = url.searchParams.get("searchBtn");
  const clearSearchSubmit = url.searchParams.get("clearSearchBtn");
  const previousPageSubmit = url.searchParams.get("previousBtn");
  const pageNumberSubmit = url.searchParams.get("pageNumberBtn");
  const nextPageSubmit = url.searchParams.get("nextBtn");

  const chapterIdUrl = url.searchParams.get("chapterId");
  const mentorIdUrl = url.searchParams.get("mentorId");
  const studentIdUrl = url.searchParams.get("studentId");

  const pageNumber = Number(url.searchParams.get("pageNumber")!);

  let chapterId: number;
  let mentorId: number | undefined;
  let studentId: number | undefined;

  const chapters = await getChaptersAsync(ability);

  if (clearSearchSubmit !== null || chapterIdUrl === "") {
    chapterId = chapters[0].id;
  } else {
    chapterId =
      chapters.find(({ id }) => id === Number(chapterIdUrl))?.id ??
      chapters[0].id;
  }
  if (clearSearchSubmit !== null || mentorIdUrl === "") {
    mentorId = undefined;
  } else if (mentorIdUrl) {
    mentorId = Number(mentorIdUrl);
  }
  if (clearSearchSubmit !== null || studentIdUrl === "") {
    studentId = undefined;
  } else if (studentIdUrl) {
    studentId = Number(studentIdUrl);
  }

  const count = await getCountAsync(chapterId, mentorId, studentId);

  const totalPageCount = Math.ceil(count / 10);

  let currentPageNumber = 0;
  if (searchTermSubmit !== null) {
    currentPageNumber = 0;
  } else if (clearSearchSubmit !== null) {
    currentPageNumber = 0;
  } else if (previousPageSubmit !== null && pageNumber > 0) {
    currentPageNumber = pageNumber - 1;
  } else if (nextPageSubmit !== null && pageNumber < totalPageCount) {
    currentPageNumber = pageNumber + 1;
  } else if (pageNumberSubmit !== null) {
    currentPageNumber = Number(pageNumberSubmit);
  }

  const goals = await getStudentGoalsAsync(
    chapterId,
    mentorId,
    studentId,
    currentPageNumber,
  );

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  const [mentors, students] = await Promise.all([
    getAvailabelMentorsAsync(ability, chapterId, studentId),
    getAvailabelStudentsAsync(ability, chapterId, mentorId),
  ]);

  return {
    mentors,
    students,
    selectedChapterId: chapterId.toString(),
    selectedMentorId: mentorId?.toString(),
    selectedStudentId: studentId?.toString(),
    chapters,
    range,
    currentPageNumber,
    count,
    goals,
  };
}

export default function Index({
  loaderData: {
    mentors,
    students,
    selectedChapterId,
    selectedMentorId,
    selectedStudentId,
    chapters,
    goals,
    count,
    currentPageNumber,
    range,
  },
}: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement | null>(null);

  const totalPageCount = Math.ceil(count / 10);

  const onFormClear = () => {
    formRef.current!.reset();

    const formData = new FormData(formRef.current!);
    formData.set("chapterId", "");
    formData.set("mentorId", "");
    formData.set("studentId", "");

    void submit(formData);
  };

  const onChapterSubmit = () => {
    const formData = new FormData(formRef.current!);
    formData.set("mentorId", "");
    formData.set("studentId", "");

    void submit(formData);
  };

  const onFormSubmit = () => {
    void submit(formRef.current);
  };

  return (
    <>
      <Title>Goals</Title>

      <hr className="my-4" />

      <Form ref={formRef}>
        <div className="mb-6 flex flex-col gap-4">
          {chapters.length > 1 && (
            <div>
              <Select
                label="Select a Chapter"
                name="chapterId"
                defaultValue={selectedChapterId}
                onChange={onChapterSubmit}
                options={chapters.map(({ id, name }) => ({
                  label: name,
                  value: id.toString(),
                }))}
              />
            </div>
          )}
          <div className="flex flex-1 flex-col gap-4 sm:flex-row">
            <div className="w-full">
              <SelectSearch
                key={`${selectedChapterId}-mentorId`}
                label="Mentor"
                name="mentorId"
                defaultValue={selectedMentorId}
                onChange={onFormSubmit}
                options={mentors.map(({ id, fullName }) => ({
                  label: fullName,
                  value: id.toString(),
                }))}
              />
            </div>

            <div className="w-full">
              <SelectSearch
                key={`${selectedChapterId}-studentId`}
                label="Student"
                name="studentId"
                defaultValue={selectedStudentId}
                options={students.map(({ id, fullName }) => ({
                  label: fullName,
                  value: id.toString(),
                }))}
                onChange={onFormSubmit}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              className="btn btn-neutral w-32"
              name="clearSearchBtn"
              value="clearSearchBtn"
              onClick={onFormClear}
              type="button"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="overflow-auto bg-white">
          <table className="table-lg sm:table-md table">
            <thead>
              <tr>
                <th align="left" className="p-2">
                  Title
                </th>
                <th align="left" className="p-2">
                  Chapter
                </th>
                <th align="left" className="p-2">
                  Student
                </th>
                <th align="left" className="p-2">
                  Mentor
                </th>
                <th align="left" className="p-2">
                  End date
                </th>
                <th align="left" className="hidden p-2 sm:table-cell">
                  Is completed
                </th>
                <th align="right" className="hidden p-2 sm:table-cell">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {goals.length === 0 && (
                <tr>
                  <td className="italic">No goals available</td>
                </tr>
              )}
              {goals.map(
                ({
                  id,
                  student,
                  chapter,
                  mentor,
                  title,
                  isAchieved,
                  endDate,
                }) => (
                  <tr key={id} className="hover:bg-base-200">
                    <td className="p-2">{title}</td>
                    <td className="p-2">{chapter.name}</td>
                    <td className="p-2">{student.fullName}</td>
                    <td className="p-2">{mentor.fullName}</td>
                    <td className="hidden p-2 sm:table-cell">
                      {endDate ? dayjs(endDate).format("MMMM D, YYYY") : "-"}
                    </td>
                    <td className="p-2">
                      {isAchieved ? (
                        <Check className="text-success" />
                      ) : (
                        <Xmark className="text-error" />
                      )}
                    </td>
                    <td className="hidden p-2 sm:table-cell" align="right">
                      <StateLink
                        to={`/admin/goals/${id}?${searchParams.toString()}`}
                        className="btn btn-success btn-xs btn-block"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </StateLink>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        <input type="hidden" name="pageNumber" value={currentPageNumber} />

        <Pagination
          range={range}
          currentPageNumber={currentPageNumber}
          totalPageCount={totalPageCount}
        />
      </Form>
    </>
  );
}
