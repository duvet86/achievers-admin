import { Link } from "@remix-run/react";

import { WarningTriangle, LogOut, Home } from "iconoir-react";

export default function Forbidden() {
  return (
    <div className="hero min-h-screen">
      <div className="hero-content flex-col">
        <img src="./images/logo.png" className="rounded-lg" alt="logo" />
        <h1 className="justify-cente mt-4 flex h-40 items-center text-4xl font-extrabold tracking-tight">
          <WarningTriangle className="mr-4 w-24 text-red-500" />
          <span className="block uppercase text-red-500 drop-shadow-md">
            Sorry, you have no permissions
          </span>
        </h1>
        <div className="flex gap-14">
          <Link to="/logout" className="btn w-40 gap-2">
            <LogOut className="h-6 w-6" />
            Logout
          </Link>
          <Link to="/" className="btn-primary btn w-40 gap-2">
            <Home className="h-6 w-6" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
