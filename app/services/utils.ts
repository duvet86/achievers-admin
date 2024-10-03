import type { Dayjs } from "dayjs";
import type { DateRange, Environment } from "./models";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

export function getExtension(fileName: string): string {
  const fileNameSplit = fileName.split(".");

  return fileNameSplit[fileNameSplit.length - 1];
}

export function getCurrentHost(request: Request): string {
  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");

  const url = new URL("/", `http://${host}`);

  return url.toString();
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export async function readFormDataAsStringsAsync(
  request: Request,
): Promise<Record<string, string | undefined>> {
  const formData = await request.formData();

  return Object.entries(Object.fromEntries(formData)).reduce<
    Record<string, string>
  >((res, [key, value]) => {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    res[key] = value?.toString().trim();

    return res;
  }, {});
}

export function parseJwt<T>(token: string): T {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}

export function isStringNullOrEmpty(
  value: string | null | undefined,
): value is null | undefined {
  return value === undefined || value === null || value.trim() === "";
}

export function isEmail(email: string) {
  const emailRegex = RegExp(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    "g",
  );

  return emailRegex.exec(email.toLowerCase()) != null;
}

export function getEnvironment(request: Request): Environment {
  const url = getCurrentHost(request);

  let environment: Environment = "production";
  if (url.includes("local")) {
    environment = "local";
  } else if (url.includes("stg")) {
    environment = "staging";
  }

  return environment;
}

export function isValidDate(date: unknown): boolean {
  return (
    Boolean(date) &&
    Object.prototype.toString.call(date) === "[object Date]" &&
    !isNaN(date as number)
  );
}

export function areEqualIgnoreCase(a: string, b: string): boolean {
  return (
    a.trim().localeCompare(b.trim(), undefined, { sensitivity: "accent" }) === 0
  );
}

export function getValueFromCircularArray(index: number, arr: string[]) {
  return arr[((index % arr.length) + arr.length) % arr.length];
}

export function areDatesOverlapping(dateRanges: DateRange[]) {
  return dateRanges.reduce<boolean>(
    (overlappping, { startDate, endDate }, index, terms) => {
      if (overlappping) {
        return true;
      }

      if (dayjs(endDate).isBefore(startDate, "day")) {
        return true;
      }

      if (
        index > 0 &&
        (dayjs(terms[index - 1].startDate).isBetween(
          terms[index].startDate,
          terms[index].endDate,
          "day",
        ) ||
          dayjs(terms[index - 1].endDate).isBetween(
            terms[index].startDate,
            terms[index].endDate,
            "day",
          ))
      ) {
        return true;
      }

      return false;
    },
    false,
  );
}

export function calculateYearLevel(dateOfBirth: Date | null): number | null {
  if (dateOfBirth === null) {
    return null;
  }

  const cutoffDateMonth = 6;
  const cutoffDateDay = 30;

  const currentYear = new Date().getFullYear();

  const dateOfBirthYear = dateOfBirth.getFullYear();
  const dateOfBirthMonth = dateOfBirth.getMonth() + 1;
  const dateOfBirthDay = dateOfBirth.getDate();

  const isWithinCutoffDate =
    dateOfBirthMonth <= cutoffDateMonth && dateOfBirthDay <= cutoffDateDay;

  if (dateOfBirthYear + 17 <= currentYear && isWithinCutoffDate) {
    return 12;
  }
  if (dateOfBirthYear + 16 <= currentYear && isWithinCutoffDate) {
    return 11;
  }
  if (dateOfBirthYear + 15 <= currentYear && isWithinCutoffDate) {
    return 10;
  }
  if (dateOfBirthYear + 14 <= currentYear && isWithinCutoffDate) {
    return 9;
  }
  if (dateOfBirthYear + 13 <= currentYear && isWithinCutoffDate) {
    return 8;
  }
  if (dateOfBirthYear + 12 <= currentYear && isWithinCutoffDate) {
    return 7;
  }
  if (dateOfBirthYear + 11 <= currentYear && isWithinCutoffDate) {
    return 6;
  }
  if (dateOfBirthYear + 10 <= currentYear && isWithinCutoffDate) {
    return 5;
  }
  if (dateOfBirthYear + 9 <= currentYear && isWithinCutoffDate) {
    return 4;
  }
  if (dateOfBirthYear + 8 <= currentYear && isWithinCutoffDate) {
    return 3;
  }
  if (dateOfBirthYear + 7 <= currentYear && isWithinCutoffDate) {
    return 2;
  }
  if (dateOfBirthYear + 6 <= currentYear && isWithinCutoffDate) {
    return 1;
  }
  if (dateOfBirthYear + 5 <= currentYear && isWithinCutoffDate) {
    return 0;
  }

  return null;
}

export function getPaginationRange(
  totalPageCount: number,
  currentPage: number,
) {
  const DOTS = -1;
  const siblingCount = 1;

  const totalPageNumbers = siblingCount + 5;

  if (totalPageNumbers < totalPageCount) {
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPageCount,
    );

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);

      return [...leftRange, DOTS, totalPageCount];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(
        totalPageCount - rightItemCount + 1,
        totalPageCount,
      );
      return [firstPageIndex, DOTS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }
  }

  return range(1, totalPageCount);
}

export function range(start: number, end: number) {
  const length = end - start + 1;

  return Array.from({ length }, (_, i) => start + i);
}

export function getDatesForTerm(startDate: Dayjs, endDate: Dayjs): string[] {
  let firstDayOfTermStart = startDate.startOf("week").day(6);
  let firstDayOfTermEnd = endDate.startOf("week").day(6);

  if (firstDayOfTermStart.isBefore(startDate)) {
    firstDayOfTermStart = firstDayOfTermStart.add(1, "week");
  }
  if (firstDayOfTermEnd.isAfter(endDate)) {
    firstDayOfTermEnd = firstDayOfTermEnd.add(-1, "week");
  }

  const numberOfWeeksInTerm = firstDayOfTermEnd.diff(
    firstDayOfTermStart,
    "week",
  );

  const dates: string[] = [];
  for (let i = 0; i <= numberOfWeeksInTerm; i++) {
    const date = firstDayOfTermStart.clone().add(i, "week");

    dates.push(date.format("YYYY-MM-DD") + "T00:00:00Z");
  }

  return dates;
}

export function isDateExpired(expiryDate: Date | undefined) {
  if (expiryDate === undefined) {
    return false;
  }

  return dayjs(expiryDate).isBefore(new Date(), "day");
}

export function getClosestSessionDate(dates: Date[]) {
  if (dates.length === 0) {
    throw new Error("Empty dates input.");
  }

  const today = new Date();
  const closest = dates.reduce((a, b) =>
    a.getDate() - today.getDate() < b.getDate() - today.getDate() ? a : b,
  );

  return dayjs(closest).format("YYYY-MM-DD") + "T00:00:00Z";
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function debounce<T extends Function>(callback: T, wait = 500) {
  let timeoutId: number | undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
      callback(...args);
    }, wait);
  };
}
