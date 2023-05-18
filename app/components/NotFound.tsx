import { Link } from "@remix-run/react";

import { LogOut, Home } from "iconoir-react";

export function NotFound() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">404</h1>
          <p className="py-6">We couldn't find that page!</p>
          <Link className="btn w-40 gap-2" to="/logout">
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
