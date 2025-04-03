import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export function isSessionDateInTheFuture(attendedOn: string) {
  return (
    dayjs.utc(attendedOn, "YYYY-MM-DD") >
    dayjs.utc(dayjs().format("YYYY-MM-DD") + "T00:00:00.000Z")
  );
}
