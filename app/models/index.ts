import type { Dayjs } from "dayjs";

export interface Term {
  id: number;
  name: string;
  start: Dayjs;
  end: Dayjs;
  year: number;
}
