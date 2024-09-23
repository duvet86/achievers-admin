import { BookmarkBook, Group } from "iconoir-react";

import { FetcherSubmitFunction } from "react-router-dom";

import { Select } from "~/components";
import { SessioViewModel } from "../services.server";

interface Props {
  attendedOn: string;
  mySession: SessioViewModel | undefined;
  studentSessions: SessioViewModel[] | undefined;
  studentsForSession:
    | {
        value: string;
        label: string;
      }[]
    | undefined;
  submit: FetcherSubmitFunction;
}

export function ManageSession({
  attendedOn,
  mySession,
  studentSessions,
  studentsForSession,
  submit,
}: Props) {
  const bookSession = (attendedOn: string) => () => {
    const studentId = (
      document.getElementById("selectedStudentId") as HTMLSelectElement
    ).value;

    if (!studentId) {
      alert("Please elect a student.");
      return;
    }

    submit(
      {
        studentId,
        attendedOn,
        action: "create",
      },
      {
        method: "POST",
        encType: "application/json",
      },
    );
  };

  const marrkAvailable = (attendedOn: string) => () => {
    submit(
      {
        studentId: null,
        attendedOn,
        action: "create",
      },
      {
        method: "POST",
        encType: "application/json",
      },
    );
  };

  const takeSessionFromPartner = (sessionId: number) => () => {
    if (
      !confirm("Are you sure you want to steal the session from you partner?")
    ) {
      return;
    }

    submit(
      {
        sessionId,
        action: "update",
      },
      {
        method: "POST",
        encType: "application/json",
      },
    );
  };

  const removeMentorForSession =
    (sessionId: number, attendedOn: string) => () => {
      if (!confirm("Are you sure you want to cancel the session?")) {
        return;
      }

      submit(
        {
          sessionId,
          attendedOn,
          action: "remove",
        },
        {
          method: "POST",
          encType: "application/json",
        },
      );
    };

  return (
    <div className="flex h-full w-full flex-col items-center gap-6 rounded border-t bg-gray-200 p-2">
      {mySession === undefined && studentsForSession && (
        <>
          <div className="flex gap-4">
            {studentsForSession.length > 0 ? (
              <div className="w-72">
                <Select
                  name="selectedStudentId"
                  required
                  options={[
                    {
                      label: "Select a student",
                      value: "",
                    },
                  ].concat(studentsForSession)}
                />
              </div>
            ) : (
              <p>No students available or assigned.</p>
            )}
            <button
              className="btn btn-success w-44"
              onClick={bookSession(attendedOn)}
            >
              <BookmarkBook />
              Book Session
            </button>
          </div>
          <div className="divider">OR</div>
          <div>
            <button
              className="btn btn-info w-44"
              onClick={marrkAvailable(attendedOn)}
            >
              <BookmarkBook />
              Mark Available
            </button>
          </div>
        </>
      )}
      {mySession && mySession.completedOn === null && (
        <div>
          <button
            className="btn btn-error w-44"
            onClick={removeMentorForSession(mySession.id, attendedOn)}
          >
            <BookmarkBook />
            Cancel Session
          </button>
        </div>
      )}
      {!mySession &&
        studentSessions
          ?.filter(({ completedOn }) => !completedOn)
          .map(({ id, user, student }) => (
            <>
              <div className="divider">OR</div>
              <div className="flex items-center gap-4">
                <button
                  className="btn btn-secondary w-44"
                  onClick={takeSessionFromPartner(id)}
                >
                  <BookmarkBook />
                  Take from
                </button>
                <div key={user.id} className="mb-2 flex gap-2">
                  <Group />
                  <span className="font-bold">
                    {user.fullName}
                  </span> mentoring{" "}
                  <span className="font-bold">{student?.fullName}</span>
                </div>
              </div>
            </>
          ))}
    </div>
  );
}
