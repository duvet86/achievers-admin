import type { Dayjs } from "dayjs";

export interface Term {
  id: number;
  label: string;
  start: Dayjs;
  end: Dayjs;
  year: number;
}

type Without<T, U> = Partial<Record<Exclude<keyof T, keyof U>, never>>;

export type XOR<T, U> =
  T extends object ?
  U extends object ?
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    (Without<T, U> & U) | (Without<U, T> & T)
  : U : T
