export default function Calendar() {
  return (
    <div className="w-full max-w-sm shadow-lg">
      <div className="rounded-t bg-white p-5 md:p-8">
        <div className="flex items-center justify-between px-4">
          <span
            tabIndex={0}
            className="text-base font-bold text-gray-800 focus:outline-none"
          >
            October 2020
          </span>
          <div className="flex items-center">
            <button
              aria-label="calendar backward"
              className="text-gray-800 hover:text-gray-400 focus:text-gray-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-chevron-left"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <polyline points="15 6 9 12 15 18" />
              </svg>
            </button>
            <button
              aria-label="calendar forward"
              className="ml-3 text-gray-800 hover:text-gray-400 focus:text-gray-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler  icon-tabler-chevron-right"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between overflow-x-auto pt-12">
          <table className="w-full">
            <thead>
              <tr>
                <th>
                  <div className="flex w-full justify-center">
                    <p className="text-center text-base font-medium text-gray-800">
                      Mo
                    </p>
                  </div>
                </th>
                <th>
                  <div className="flex w-full justify-center">
                    <p className="text-center text-base font-medium text-gray-800">
                      Tu
                    </p>
                  </div>
                </th>
                <th>
                  <div className="flex w-full justify-center">
                    <p className="text-center text-base font-medium text-gray-800">
                      We
                    </p>
                  </div>
                </th>
                <th>
                  <div className="flex w-full justify-center">
                    <p className="text-center text-base font-medium text-gray-800">
                      Th
                    </p>
                  </div>
                </th>
                <th>
                  <div className="flex w-full justify-center">
                    <p className="text-center text-base font-medium text-gray-800">
                      Fr
                    </p>
                  </div>
                </th>
                <th>
                  <div className="flex w-full justify-center">
                    <p className="text-center text-base font-medium text-gray-800">
                      Sa
                    </p>
                  </div>
                </th>
                <th>
                  <div className="flex w-full justify-center">
                    <p className="text-center text-base font-medium text-gray-800">
                      Su
                    </p>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="pt-6">
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2"></div>
                </td>
                <td className="pt-6">
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2"></div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2"></div>
                </td>
                <td className="pt-6">
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">1</p>
                  </div>
                </td>
                <td className="pt-6">
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">2</p>
                  </div>
                </td>
                <td className="pt-6">
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base text-gray-500">3</p>
                  </div>
                </td>
                <td className="pt-6">
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base text-gray-500">4</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">5</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">6</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">7</p>
                  </div>
                </td>
                <td>
                  <div className="h-full w-full">
                    <div className="flex w-full cursor-pointer items-center justify-center rounded-full">
                      <span
                        role="link"
                        tabIndex={0}
                        className="flex  h-8 w-8 items-center justify-center rounded-full bg-indigo-700 text-base font-medium text-white hover:bg-indigo-500 focus:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2"
                      >
                        8
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">9</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base text-gray-500">10</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base text-gray-500">11</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">12</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">13</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">14</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">15</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">16</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base text-gray-500">17</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base text-gray-500">18</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">19</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">20</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">21</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">22</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">23</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base text-gray-500">24</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base text-gray-500">25</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">26</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">27</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">28</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">29</p>
                  </div>
                </td>
                <td>
                  <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                    <p className="text-base font-medium text-gray-500">30</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
