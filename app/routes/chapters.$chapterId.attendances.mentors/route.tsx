import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { Attendance } from "./services.server";

import { Form, useLoaderData, useSubmit } from "react-router";
import { useRef } from "react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import classNames from "classnames";
import { Check, Xmark } from "iconoir-react";

import {
  getClosestSessionToToday,
  getCurrentTermForDate,
  getDatesForTerm,
} from "~/services";
import { getSchoolTermsAsync } from "~/services/.server";
import { Input, Select, Title } from "~/components";

import {
  attendSession,
  getMentorAttendancesLookup,
  getMentorsForSession,
  removeAttendace,
} from "./services.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const CURRENT_YEAR = dayjs().year();

  const url = new URL(request.url);
  const searchTerm = url.searchParams.get("search");
  const selectedTermYear =
    url.searchParams.get("selectedTermYear") ?? CURRENT_YEAR.toString();
  const selectedTermId = url.searchParams.get("selectedTermId");
  let selectedTermDate = url.searchParams.get("selectedTermDate");

  const terms = await getSchoolTermsAsync();
  const currentTerm = getCurrentTermForDate(terms, new Date());

  const distinctTermYears = Array.from(new Set(terms.map(({ year }) => year)));
  const termsForYear = terms.filter(
    ({ year }) => year.toString() === selectedTermYear,
  );

  let selectedTerm = termsForYear.find(
    (t) => t.id.toString() === selectedTermId,
  );

  if (!selectedTerm) {
    if (selectedTermYear === CURRENT_YEAR.toString()) {
      selectedTerm = currentTerm;
    } else {
      selectedTerm = termsForYear[0];
    }
  }

  const sessionDates = getDatesForTerm(selectedTerm.start, selectedTerm.end);

  if (selectedTermDate === null || !sessionDates.includes(selectedTermDate)) {
    selectedTermDate = getClosestSessionToToday(
      sessionDates.map((date) => dayjs(date).toDate()),
    );
  }

  if (selectedTermDate === null) {
    throw new Error("selectedTermDate is not defined;");
  }

  const mentors = await getMentorsForSession(
    Number(params.chapterId),
    searchTerm,
  );

  const attendacesLookup = await getMentorAttendancesLookup(
    Number(params.chapterId),
    selectedTermDate,
  );

  return {
    chapterId: params.chapterId,
    mentors,
    attendacesLookup,
    selectedTermYear,
    selectedTermId: selectedTerm.id.toString(),
    selectedTermDate,
    searchTerm: searchTerm ?? "",
    termYearsOptions: distinctTermYears.map((year) => ({
      value: year.toString(),
      label: year.toString(),
    })),
    termsOptions: termsForYear.map(({ id, start, end, name }) => ({
      value: id.toString(),
      label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")}) ${currentTerm.id === id ? " (Current)" : ""}`,
    })),
    sessionDates: sessionDates
      .map((attendedOn) => dayjs(attendedOn))
      .map((attendedOn) => ({
        value: attendedOn.toISOString(),
        label: attendedOn.format("DD/MM/YYYY"),
      })),
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const bodyData = (await request.json()) as {
    action: "attend" | "remove";
    mentorId: number;
    attendaceId: number;
    attendanceDate: string;
  };

  if (bodyData.action === "attend") {
    await attendSession(
      Number(params.chapterId),
      bodyData.mentorId,
      bodyData.attendanceDate,
    );
  } else if (bodyData.action === "remove") {
    await removeAttendace(bodyData.attendaceId);
  } else {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Invalid action: ${bodyData.action}`);
  }

  return null;
}

export default function Index() {
  const {
    chapterId,
    mentors,
    attendacesLookup,
    selectedTermYear,
    selectedTermId,
    selectedTermDate,
    searchTerm,
    termYearsOptions,
    termsOptions,
    sessionDates,
  } = useLoaderData<typeof loader>();
  const attendacesLookup2 = attendacesLookup as Record<number, Attendance>;
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement | null>(null);

  const attend = (mentorId: number) => () => {
    void submit(
      { action: "attend", mentorId, attendanceDate: selectedTermDate },
      { method: "POST", encType: "application/json" },
    );
  };

  const removeAttendance = (attendace: Attendance) => () => {
    if (
      !confirm(
        `Are you sure you want to remove the attendace for "${attendace.user.fullName}"?`,
      )
    ) {
      return;
    }

    void submit(
      { action: "remove", attendaceId: attendace.id },
      { method: "POST", encType: "application/json" },
    );
  };

  const submitForm = () => {
    const formData = new FormData(formRef.current!);
    void submit(formData);
  };

  const onResetClick = () => {
    const formData = new FormData(formRef.current!);
    formData.set("search", "");
    void submit(formData);
  };

  return (
    <>
      <Title to={`/chapters/${chapterId}/attendances`}>
        Mentor attendances &quot;
        {dayjs(selectedTermDate).format("D MMMM YYYY")}
        &quot;
      </Title>

      <Form
        ref={formRef}
        className="mt-4 flex flex-col items-end gap-4 sm:flex-row"
      >
        <div className="w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <div key={selectedTermId} className="w-full sm:w-auto">
              <label className="fieldset-label">Term</label>
              <div className="join">
                <select
                  className="select join-item basis-28"
                  name="selectedTermYear"
                  defaultValue={selectedTermYear}
                  onChange={submitForm}
                >
                  {termYearsOptions.map(({ label, value }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  className="select join-item"
                  name="selectedTermId"
                  defaultValue={selectedTermId}
                  onChange={submitForm}
                >
                  {termsOptions.map(({ label, value }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <Select
            key={selectedTermDate}
            label="Session date"
            name="selectedTermDate"
            defaultValue={selectedTermDate}
            options={sessionDates}
            onChange={submitForm}
          />
        </div>

        <div className="w-full sm:w-auto">
          <Input
            label="Search for a mentor (Press enter to submit)"
            name="search"
            defaultValue={searchTerm}
            hasButton
            placeholder="Search for a mentor"
            onButtonClick={onResetClick}
          />
        </div>
      </Form>

      <ul className="list bg-base-100 mt-2">
        {mentors.map(({ id: mentorId, fullName }, index) => (
          <li
            key={mentorId}
            className={classNames("list-row flex cursor-pointer items-center", {
              "bg-green-200": attendacesLookup2[mentorId],
              "hover:bg-gray-200": !attendacesLookup2[mentorId],
            })}
            onClick={
              attendacesLookup2[mentorId]
                ? removeAttendance(attendacesLookup2[mentorId])
                : attend(mentorId)
            }
          >
            <div className="border-r pr-2 text-4xl font-thin tabular-nums opacity-30">
              {index}
            </div>

            <h2 className="flex-1 text-2xl font-thin">{fullName}</h2>

            <div>
              {attendacesLookup2[mentorId] ? (
                <button className="btn btn-error">
                  <span className="hidden sm:block">Remove attendance</span>
                  <Xmark />
                </button>
              ) : (
                <button className="btn btn-outline">
                  <span className="hidden sm:block">Mark attendance</span>
                  <Check />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
