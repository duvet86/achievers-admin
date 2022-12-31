export default function Roster() {
  return (
    <div className="container mx-auto mt-10">
      <div className="wrapper w-full rounded bg-white shadow">
        <div className="header flex justify-between border-b p-2">
          <span className="text-lg font-bold">2020 July</span>
          <div className="buttons">
            <button className="p-1">
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 16 16"
                className="bi bi-arrow-left-circle"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
                />
                <path
                  fillRule="evenodd"
                  d="M8.354 11.354a.5.5 0 0 0 0-.708L5.707 8l2.647-2.646a.5.5 0 1 0-.708-.708l-3 3a.5.5 0 0 0 0 .708l3 3a.5.5 0 0 0 .708 0z"
                />
                <path
                  fillRule="evenodd"
                  d="M11.5 8a.5.5 0 0 0-.5-.5H6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 .5-.5z"
                />
              </svg>
            </button>
            <button className="p-1">
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 16 16"
                className="bi bi-arrow-right-circle"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
                />
                <path
                  fillRule="evenodd"
                  d="M7.646 11.354a.5.5 0 0 1 0-.708L10.293 8 7.646 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0z"
                />
                <path
                  fillRule="evenodd"
                  d="M4.5 8a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5z"
                />
              </svg>
            </button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="lg:w-30 md:w-30 h-10 w-10 border-r p-2 text-xs sm:w-20 xl:w-40 xl:text-sm">
                <span className="hidden sm:block md:block lg:block xl:block">
                  Sunday
                </span>
                <span className="block sm:hidden md:hidden lg:hidden xl:hidden">
                  Sun
                </span>
              </th>
              <th className="lg:w-30 md:w-30 h-10 w-10 border-r p-2 text-xs sm:w-20 xl:w-40 xl:text-sm">
                <span className="hidden sm:block md:block lg:block xl:block">
                  Monday
                </span>
                <span className="block sm:hidden md:hidden lg:hidden xl:hidden">
                  Mon
                </span>
              </th>
              <th className="lg:w-30 md:w-30 h-10 w-10 border-r p-2 text-xs sm:w-20 xl:w-40 xl:text-sm">
                <span className="hidden sm:block md:block lg:block xl:block">
                  Tuesday
                </span>
                <span className="block sm:hidden md:hidden lg:hidden xl:hidden">
                  Tue
                </span>
              </th>
              <th className="lg:w-30 md:w-30 h-10 w-10 border-r p-2 text-xs sm:w-20 xl:w-40 xl:text-sm">
                <span className="hidden sm:block md:block lg:block xl:block">
                  Wednesday
                </span>
                <span className="block sm:hidden md:hidden lg:hidden xl:hidden">
                  Wed
                </span>
              </th>
              <th className="lg:w-30 md:w-30 h-10 w-10 border-r p-2 text-xs sm:w-20 xl:w-40 xl:text-sm">
                <span className="hidden sm:block md:block lg:block xl:block">
                  Thursday
                </span>
                <span className="block sm:hidden md:hidden lg:hidden xl:hidden">
                  Thu
                </span>
              </th>
              <th className="lg:w-30 md:w-30 h-10 w-10 border-r p-2 text-xs sm:w-20 xl:w-40 xl:text-sm">
                <span className="hidden sm:block md:block lg:block xl:block">
                  Friday
                </span>
                <span className="block sm:hidden md:hidden lg:hidden xl:hidden">
                  Fri
                </span>
              </th>
              <th className="lg:w-30 md:w-30 h-10 w-10 border-r p-2 text-xs sm:w-20 xl:w-40 xl:text-sm">
                <span className="hidden sm:block md:block lg:block xl:block">
                  Saturday
                </span>
                <span className="block sm:hidden md:hidden lg:hidden xl:hidden">
                  Sat
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-20 text-center">
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40 ">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">1</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1">
                    <div className="event mb-1 rounded bg-purple-400 p-1 text-sm text-white">
                      <span className="event-name">Meeting</span>
                      <span className="time">12:00~14:00</span>
                    </div>
                    <div className="event mb-1 rounded bg-purple-400 p-1 text-sm text-white">
                      <span className="event-name">Meeting</span>
                      <span className="time">18:00~20:00</span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">2</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">3</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">4</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">6</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-hidden border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">7</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1">
                    <div className="event mb-1 rounded bg-blue-400 p-1 text-sm text-white">
                      <span className="event-name">Shopping</span>
                      <span className="time">12:00~14:00</span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-sm text-gray-500">8</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
            </tr>

            <tr className="h-20 text-center">
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">9</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">10</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">12</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">13</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">14</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">15</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-sm text-gray-500">16</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
            </tr>

            <tr className="h-20 text-center">
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">16</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">17</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">18</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">19</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">20</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">21</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-sm text-gray-500">22</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
            </tr>

            <tr className="h-20 text-center">
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">23</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">24</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">25</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">26</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">27</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">28</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-sm text-gray-500">29</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
            </tr>

            <tr className="h-20 text-center">
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">30</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">31</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border bg-gray-100 p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">1</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border bg-gray-100 p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">2</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border bg-gray-100 p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">3</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border bg-gray-100 p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-gray-500">4</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
              <td className="lg:w-30 md:w-30 ease h-40 w-10 cursor-pointer overflow-auto border bg-gray-100 p-1 transition duration-500 hover:bg-gray-300 sm:w-20 xl:w-40">
                <div className="lg:w-30 md:w-30 mx-auto mx-auto flex h-40 w-10 flex-col overflow-hidden sm:w-full xl:w-40">
                  <div className="top h-5 w-full">
                    <span className="text-sm text-gray-500">5</span>
                  </div>
                  <div className="bottom h-30 w-full flex-grow cursor-pointer py-1"></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
