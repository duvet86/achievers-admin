import { Link } from "@remix-run/react";

import { WarningTriangle, LogOut, Home } from "iconoir-react";

export function UnexpectedError() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content">
        <div className="flex max-w-md flex-col items-center justify-center">
          <h1 className="mt-4 flex h-40 flex-col items-center text-4xl font-extrabold tracking-tight">
            <WarningTriangle className="mr-4 w-24 text-red-500" />
            <span className="block text-center uppercase text-red-500 drop-shadow-md">
              Something went wrong!
            </span>
          </h1>
          <div className="flex gap-14">
            <Link to="/" className="btn btn-primary w-40 gap-2">
              <Home className="h-6 w-6" />
              Home
            </Link>
            <Link className="btn w-40 gap-2" to="/logout">
              <LogOut className="h-6 w-6" />
              Logout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
