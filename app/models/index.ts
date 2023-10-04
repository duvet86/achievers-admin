import type { Dayjs } from "dayjs";

export interface Term {
  name: string;
  start: Dayjs;
  end: Dayjs;
}
