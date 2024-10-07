import type { SessionLookup, SessionLookupStudent } from "../services.server";

import { useFetcher } from "@remix-run/react";
import dayjs from "dayjs";
import classNames from "classnames";
import { useState } from "react";
import { Check, ThumbsUp, Xmark, Group, Plus, Minus } from "iconoir-react";

import { ManageSession } from "./ManageSession";

interface Props {
  datesInTerm: string[];
  mySessionsLookup: SessionLookup;
  myStudentsSessionsLookup: SessionLookupStudent;
}

export default function TermCalendar({
  datesInTerm,
  mySessionsLookup,
  myStudentsSessionsLookup,
}: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const { state, data, submit } = useFetcher<{
    studentsForSession: {
      value: string;
      label: string;
    }[];
  }>();

  const onRowClick =
    (index: number, attendedOn: string, isSessionBooked: boolean) => () => {
      const newOpen = open === index ? null : index;
      setOpen(newOpen);

      if (newOpen !== null) {
        if (isSessionBooked) {
          submit(
            {
              action: "fetch",
              attendedOn,
            },
            {
              method: "POST",
              encType: "application/json",
            },
          );
        }

        setTimeout(
          () =>
            document.getElementById(`row-${index}`)!.scrollIntoView({
              behavior: "smooth",
              block: "center",
            }),
          210,
        );
      }
    };

  const isLoading = state === "loading";

  return (
    <div className="relative">
      <div className="hidden w-full sm:flex">
        <div className="m-2 basis-1/6">Session date</div>
        <div className="m-2 basis-2/6">Status</div>
        <div className="m-2 basis-1/6">Report completed</div>
        <div className="m-2 basis-1/6">Signed off</div>
        <div className="m-2 basis-1/6 text-center">Action</div>
      </div>

      {open !== null && (
        <div
          className="absolute inset-0 z-10"
          style={{ background: "#0006" }}
          aria-hidden="true"
        ></div>
      )}

      <div className="join join-vertical w-full">
        {datesInTerm.map((attendedOn, index) => {
          const mySession = mySessionsLookup[attendedOn];
          const studentSessions = myStudentsSessionsLookup[attendedOn];

          return (
            <div
              key={attendedOn}
              className={classNames("collapse join-item border", {
                "z-10 bg-white": open === index,
              })}
            >
              <input
                type="checkbox"
                name="accordion"
                onClick={onRowClick(index, attendedOn, mySession === undefined)}
              />

              <div className="collapse-title flex w-full flex-col pe-0 sm:flex-row">
                <div className="p-2 font-medium text-gray-800 sm:basis-1/6">
                  <div className="mb-2 flex justify-center gap-4 text-lg sm:flex-col sm:justify-start sm:gap-0 sm:text-base">
                    <span>{dayjs(attendedOn).format("dddd")}</span>
                    <span>{dayjs(attendedOn).format("DD/MM/YYYY")}</span>
                  </div>
                </div>

                <div className="mb-4 flex flex-col gap-4 sm:mb-0 sm:basis-2/6">
                  {mySession && (
                    <div className="flex items-center justify-center gap-2 sm:justify-start">
                      <ThumbsUp className="h-4 w-4 sm:h-6 sm:w-6" />
                      {`${mySession.user.fullName} (Me) ${mySession.student ? `with ${mySession.student.fullName}` : "marked available"}`}
                    </div>
                  )}
                  {studentSessions?.map(({ user, student }) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-center gap-2 text-info sm:justify-start"
                    >
                      <Group className="h-4 w-4 sm:h-6 sm:w-6" />
                      <span className="font-bold">{user.fullName}</span>{" "}
                      mentoring{" "}
                      <span className="font-bold">{student?.fullName}</span>
                    </div>
                  ))}
                  {!mySession && !studentSessions?.length && (
                    <div className="flex w-full items-center justify-center sm:hidden">
                      <Minus className="h-4 w-4 text-gray-400" />
                      &nbsp;
                    </div>
                  )}
                </div>

                <div className="hidden basis-1/6 flex-col gap-4 sm:flex">
                  {mySession &&
                    (mySession.student ? (
                      mySession.completedOn ? (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          {dayjs(mySession.completedOn).format("MMMM D, YYYY")}
                        </div>
                      ) : (
                        <div className="flex w-full items-center">
                          <Xmark className="h-4 w-4 text-error" />
                          &nbsp;
                        </div>
                      )
                    ) : (
                      <div className="flex w-full items-center">
                        <Minus className="h-4 w-4 text-gray-400" />
                        &nbsp;
                      </div>
                    ))}
                  {studentSessions?.map(({ id, completedOn }) =>
                    completedOn ? (
                      <div key={id} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-success" />
                        {dayjs(completedOn).format("MMMM D, YYYY")}
                      </div>
                    ) : (
                      <div key={id} className="flex w-full items-center">
                        <Xmark className="h-4 w-4 text-error" />
                        &nbsp;
                      </div>
                    ),
                  )}
                </div>

                <div className="hidden basis-1/6 flex-col gap-4 sm:flex">
                  {mySession &&
                    (mySession.student ? (
                      mySession.signedOffOn ? (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          {dayjs(mySession.signedOffOn).format("MMMM D, YYYY")}
                        </div>
                      ) : (
                        <div className="flex w-full items-center">
                          <Xmark className="h-4 w-4 text-error" />
                          &nbsp;
                        </div>
                      )
                    ) : (
                      <div className="flex w-full items-center">
                        <Minus className="h-4 w-4 text-gray-400" />
                        &nbsp;
                      </div>
                    ))}
                  {studentSessions?.map(({ id, signedOffOn }) =>
                    signedOffOn ? (
                      <div key={id} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-success" />
                        {dayjs(signedOffOn).format("MMMM D, YYYY")}
                      </div>
                    ) : (
                      <div key={id} className="flex w-full items-center">
                        <Xmark className="h-4 w-4 text-error" />
                        &nbsp;
                      </div>
                    ),
                  )}
                </div>
                <div className="flex items-center justify-center gap-4 p-2 sm:basis-1/6 sm:justify-end sm:gap-0">
                  <button className="btn btn-outline w-36">
                    {open !== index ? (
                      <>
                        <Plus />
                        Manage
                      </>
                    ) : (
                      <>
                        <Minus />
                        Close
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="collapse-content flex" id={`row-${index}`}>
                {open === index && (
                  <>
                    <div className="sm:basis-1/6 sm:pl-64"></div>
                    {isLoading ? (
                      <div className="flex w-full flex-col gap-4">
                        <div className="skeleton h-8 w-full"></div>
                        <div className="skeleton h-8 w-full"></div>
                        <div className="skeleton h-8 w-full"></div>
                        <div className="skeleton h-8 w-full"></div>
                      </div>
                    ) : (
                      <ManageSession
                        attendedOn={attendedOn}
                        mySession={mySession}
                        studentSessions={studentSessions}
                        studentsForSession={data?.studentsForSession}
                        submit={submit}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
