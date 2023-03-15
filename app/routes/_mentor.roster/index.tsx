import type { Dayjs } from "dayjs";

import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";

import RosterCalendar from "./RosterCalendar";
import Calendar from "./Calendar";

export default function Index() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const currentDay = useMemo(() => dayjs().toDate(), []);

  const firstDayOfTheMonth = useMemo(
    () => selectedDate.clone().startOf("month"),
    [selectedDate]
  );

  const firstDayOfFirstWeekOfMonth = useMemo(
    () => dayjs(firstDayOfTheMonth).startOf("week"),
    [firstDayOfTheMonth]
  );

  const generateFirstDayOfEachWeek = useCallback((day: Dayjs): Dayjs[] => {
    const dates: Dayjs[] = [day];
    for (let i = 1; i < 6; i++) {
      const date = day.clone().add(i, "week");
      dates.push(date);
    }
    return dates;
  }, []);

  const generateWeek = useCallback((day: Dayjs): Date[] => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = day.clone().add(i, "day").toDate();
      dates.push(date);
    }
    return dates;
  }, []);

  const generateWeeksOfTheMonth = useMemo((): Date[][] => {
    const firstDayOfEachWeek = generateFirstDayOfEachWeek(
      firstDayOfFirstWeekOfMonth
    );
    return firstDayOfEachWeek.map((date) => generateWeek(date));
  }, [generateFirstDayOfEachWeek, firstDayOfFirstWeekOfMonth, generateWeek]);

  const previousMonth = () =>
    setSelectedDate((date) => date.subtract(1, "month"));

  const nextMonth = () => setSelectedDate((date) => date.add(1, "month"));

  return (
    <div className="flex">
      <Calendar
        selectedDate={selectedDate}
        previousMonth={previousMonth}
        nextMonth={nextMonth}
        generateWeeksOfTheMonth={generateWeeksOfTheMonth}
        currentDay={currentDay}
      />
      <RosterCalendar
        selectedDate={selectedDate}
        previousMonth={previousMonth}
        nextMonth={nextMonth}
        generateWeeksOfTheMonth={generateWeeksOfTheMonth}
      />
    </div>
  );
}
