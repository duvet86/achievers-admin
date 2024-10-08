import type { FetcherSubmitFunction } from "react-router-dom";
import type { SessioViewModel } from "../services.server";

import { Fragment } from "react/jsx-runtime";
import { BookmarkBook, Group } from "iconoir-react";

import { Select } from "~/components";

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
  setOpen: React.Dispatch<React.SetStateAction<number | null>>;
}

export function ManageSession({
  attendedOn,
  mySession,
  studentSessions,
  studentsForSession,
  submit,
  setOpen,
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

    setOpen(null);
  };

  const markAvailable = (attendedOn: string) => () => {
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

    setOpen(null);
  };

  const takeSessionFromPartner = (sessionId: number) => () => {
    if (
      !confirm("Are you sure you want to take the session from you partner?")
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

    setOpen(null);
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
          <div className="flex flex-wrap gap-4">
            {studentsForSession.length > 0 ? (
              <>
                <div className="w-full sm:w-72">
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
                <button
                  className="btn btn-success w-full sm:w-44"
                  onClick={bookSession(attendedOn)}
                >
                  <BookmarkBook />
                  Book Session
                </button>
              </>
            ) : (
              <p>
                Cannot book session with student because no students are
                available or assigned.
              </p>
            )}
          </div>
          <div className="divider">OR</div>
          <button
            className="btn btn-info w-full sm:w-44"
            onClick={markAvailable(attendedOn)}
          >
            <BookmarkBook />
            Mark Available
          </button>
        </>
      )}
      {mySession && mySession.completedOn === null && (
        <button
          className="btn btn-error w-full sm:w-44"
          onClick={removeMentorForSession(mySession.id, attendedOn)}
        >
          <BookmarkBook />
          Cancel Session
        </button>
      )}
      {!mySession &&
        studentSessions
          ?.filter(({ completedOn }) => !completedOn)
          .map(({ id, user, student }) => (
            <Fragment key={id}>
              <div className="divider">OR</div>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  className="btn btn-secondary w-full sm:w-44"
                  onClick={takeSessionFromPartner(id)}
                >
                  <BookmarkBook />
                  Take from
                </button>
                <div key={user.id} className="mb-2 flex gap-2">
                  <Group />
                  <span className="font-bold">{user.fullName}</span>mentoring
                  <span className="font-bold">{student?.fullName}</span>
                </div>
              </div>
            </Fragment>
          ))}
    </div>
  );
}
