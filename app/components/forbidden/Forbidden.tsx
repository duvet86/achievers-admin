import { Link } from "react-router";

import { WarningTriangle, LogOut, Home } from "iconoir-react";

export function Forbidden() {
  return (
    <div className="hero bg-base-100 min-h-screen">
      <div className="hero-content">
        <div className="flex max-w-md flex-col items-center justify-center">
          <h1 className="mt-4 flex h-40 flex-col items-center text-4xl font-extrabold tracking-tight">
            <WarningTriangle className="mr-4 w-24 text-red-500" />
            <span className="block text-center text-red-500 uppercase drop-shadow-md">
              Sorry, you have no permissions!
            </span>
          </h1>
          <div className="flex gap-14">
            <Link className="btn w-40 gap-2" to="/logout">
              <LogOut className="h-6 w-6" />
              Logout
            </Link>
            <Link to="/" className="btn btn-primary w-40 gap-2">
              <Home className="h-6 w-6" />
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
