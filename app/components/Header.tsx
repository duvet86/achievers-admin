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
          <a
            href="#responsive-header"
            className="mt-4 mr-6 block text-white hover:text-white lg:mt-0 lg:inline-block"
          >
            Docs
          </a>
          <a
            href="#responsive-header"
            className="mt-4 mr-6 block text-white hover:text-white lg:mt-0 lg:inline-block"
          >
            Examples
          </a>
          <a
            href="#responsive-header"
            className="mt-4 block text-white hover:text-white lg:mt-0 lg:inline-block"
          >
            Blog
          </a>
        </div>
        <div>
          <a
            href="#"
            className="mt-4 inline-block rounded border border-white px-4 py-2 text-sm leading-none text-white hover:border-transparent hover:bg-white hover:text-teal-500 lg:mt-0"
          >
            Download
          </a>
        </div>
      </div>
    </nav>
  );
}
