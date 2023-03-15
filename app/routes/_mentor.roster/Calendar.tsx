import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";

interface Props {
  selectedDate: Dayjs;
  previousMonth: () => void;
  nextMonth: () => void;
  generateWeeksOfTheMonth: Date[][];
  currentDay: Date;
}

export default function Calendar({
  selectedDate,
  previousMonth,
  nextMonth,
  generateWeeksOfTheMonth,
  currentDay,
}: Props) {
  return (
    <div className="hidden w-full max-w-sm md:block">
      <div className="rounded-t bg-white p-5 md:p-8">
        <div className="flex items-center justify-between px-4">
          <span
            tabIndex={0}
            className="text-base font-bold text-gray-800 focus:outline-none"
          >
            {selectedDate.clone().format("YYYY MMM")}
          </span>
          <div className="flex items-center">
            <button
              aria-label="calendar backward"
              className="text-gray-800 hover:text-gray-400 focus:text-gray-400"
              onClick={previousMonth}
            >
              <ArrowLeftIcon className="w-6 text-blue-600" />
            </button>
            <button
              aria-label="calendar forward"
              className="ml-3 text-gray-800 hover:text-gray-400 focus:text-gray-400"
              onClick={nextMonth}
            >
              <ArrowRightIcon className="w-6 text-blue-600" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between overflow-x-auto pt-12">
          <table className="w-full">
            <thead>
              <tr>
                {generateWeeksOfTheMonth[0].map((day, index) => (
                  <th key={`week-day-${index}`}>
                    <div className="flex w-full justify-center">
                      <p className="text-center text-base font-medium text-gray-800">
                        {dayjs(day).format("dd")}
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {generateWeeksOfTheMonth.map((week, weekIndex) => (
                <tr key={`week-${weekIndex}`}>
                  {week.map((day, dayIndex) => (
                    <td className="pt-6" key={`day-${dayIndex}`}>
                      {dayjs(currentDay).isSame(day, "date") ? (
                        <div className="h-full w-full">
                          <div className="flex w-full cursor-pointer items-center justify-center rounded-full">
                            <span
                              role="link"
                              tabIndex={0}
                              className="flex  h-8 w-8 items-center justify-center rounded-full bg-indigo-700 text-base font-medium text-white hover:bg-indigo-500 focus:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2"
                            >
                              {day.getDate()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex w-full cursor-pointer justify-center px-2 py-2">
                          <p
                            className={
                              "text-base font-medium " +
                              (selectedDate.clone().toDate().getMonth() !==
                              day.getMonth()
                                ? "text-gray-400"
                                : "text-gray-700")
                            }
                          >
                            {day.getDate()}
                          </p>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
