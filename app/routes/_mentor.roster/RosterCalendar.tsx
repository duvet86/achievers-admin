import type { Dayjs } from "dayjs";

import dayjs from "dayjs";

import { ArrowLeftCircle, ArrowRightCircle } from "iconoir-react";

interface Props {
  selectedDate: Dayjs;
  previousMonth: () => void;
  nextMonth: () => void;
  generateWeeksOfTheMonth: Date[][];
}

export default function RosterCalendar({
  selectedDate,
  previousMonth,
  nextMonth,
  generateWeeksOfTheMonth,
}: Props) {
  return (
    <div className="container mt-10">
      <div className="wrapper w-full rounded bg-white shadow">
        <div className="header flex justify-between border-b p-2">
          <span className="text-lg font-bold">
            {selectedDate.clone().format("YYYY MMM")}
          </span>
          <div className="buttons">
            <button className="p-1" onClick={previousMonth}>
              <ArrowLeftCircle className="w-8 text-blue-600" />
            </button>
            <button className="p-1" onClick={nextMonth}>
              <ArrowRightCircle className="w-8 text-blue-600" />
            </button>
          </div>
        </div>
        <div className="h-full w-full">
          <div>
            <div className="flex justify-between">
              {generateWeeksOfTheMonth[0].map((day, index) => (
                <div
                  key={`week-day-${index}`}
                  className="flex h-10 basis-4/12 justify-center border-b border-r p-2 text-xs xl:text-sm"
                >
                  <span className="hidden font-medium text-gray-800 sm:block md:block lg:block xl:block">
                    {dayjs(day).format("dddd")}
                  </span>
                  <span className="block font-medium text-gray-800 sm:hidden md:hidden lg:hidden xl:hidden">
                    {dayjs(day).format("dd")}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            {generateWeeksOfTheMonth.map((week, weekIndex) => (
              <div key={`week-${weekIndex}`} className="flex justify-between">
                {week.map((day, dayIndex) => (
                  <div
                    key={`day-${dayIndex}`}
                    className="ease h-24 basis-4/12 cursor-pointer overflow-auto border-b border-r p-4 transition duration-500 hover:bg-gray-300"
                  >
                    <div className="lmx-auto mx-auto flex flex-col overflow-hidden sm:w-full">
                      <div className="top w-full">
                        <span
                          className={
                            "font-medium " +
                            (selectedDate.clone().toDate().getMonth() !==
                            day.getMonth()
                              ? "text-gray-400"
                              : "text-gray-700")
                          }
                        >
                          {day.getDate()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
