import { Link } from "@remix-run/react";

export default function Header() {
  return (
    <nav className="flex flex-wrap items-center justify-between bg-blue-500 p-2">
      <div className="mr-6 flex flex-shrink-0 items-center text-white">
        <img className="mr-4 w-16 rounded" src="/images/logo.png" alt="Logo" />
        <span className="text-xl font-semibold tracking-tight">
          Achievers WA
        </span>
      </div>
      <div className="block lg:hidden">
        <button className="flex items-center rounded border border-white px-3 py-2 text-white">
          <svg
            className="h-3 w-3 fill-current"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>
      <div className="block w-full flex-grow lg:flex lg:w-auto lg:items-center">
        <div className="lg:flex-grow">
          <Link
            to="/users"
            className="mt-4 mr-6 block text-white hover:text-white lg:mt-0 lg:inline-block"
          >
            Users
          </Link>
          <Link
            to="/chapters"
            className="mt-4 block text-white hover:text-white lg:mt-0 lg:inline-block"
          >
            Chapters
          </Link>
        </div>
        <div>
          <Link
            to="/logout"
            className="mt-4 inline-block rounded border border-white px-4 py-2 text-sm leading-none text-white hover:border-transparent hover:bg-white hover:text-teal-500 lg:mt-0"
          >
            Logout
          </Link>
        </div>
      </div>
    </nav>
  );
}
