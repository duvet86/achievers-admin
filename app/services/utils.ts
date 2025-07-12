import type { Dayjs } from "dayjs";
import type { RootNode, EditorState } from "lexical";
import type { Term } from "~/models";
import type { DateRange, Environment } from "./models";

import { $getRoot } from "lexical";
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

  const currentYear = new Date().getFullYear();
  const dateOfBirthYear = dateOfBirth.getFullYear();

  if (dateOfBirthYear + 17 <= currentYear) {
    return 12;
  }
  if (dateOfBirthYear + 16 <= currentYear) {
    return 11;
  }
  if (dateOfBirthYear + 15 <= currentYear) {
    return 10;
  }
  if (dateOfBirthYear + 14 <= currentYear) {
    return 9;
  }
  if (dateOfBirthYear + 13 <= currentYear) {
    return 8;
  }
  if (dateOfBirthYear + 12 <= currentYear) {
    return 7;
  }
  if (dateOfBirthYear + 11 <= currentYear) {
    return 6;
  }
  if (dateOfBirthYear + 10 <= currentYear) {
    return 5;
  }
  if (dateOfBirthYear + 9 <= currentYear) {
    return 4;
  }
  if (dateOfBirthYear + 8 <= currentYear) {
    return 3;
  }
  if (dateOfBirthYear + 7 <= currentYear) {
    return 2;
  }
  if (dateOfBirthYear + 6 <= currentYear) {
    return 1;
  }
  if (dateOfBirthYear + 5 <= currentYear) {
    return 0;
  }

  return 12;
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

    dates.push(date.format("YYYY-MM-DD") + "T00:00:00.000Z");
  }

  return dates;
}

export function isDateExpired(expiryDate: Date | undefined) {
  if (expiryDate === null) {
    return false;
  }

  return dayjs(expiryDate).isBefore(new Date(), "day");
}

export function getClosestSessionToToday(dates: Date[]) {
  if (dates.length === 0) {
    return null;
  }

  const today = new Date();

  const closest = dates.reduce((a, b) => {
    const adiff = a.getTime() - today.getTime();
    return adiff > 0 && adiff < b.getTime() - today.getTime() ? a : b;
  });

  if (closest > today) {
    const index = dates.findIndex((date) => date === closest);
    return dayjs(dates[index - 1]).format("YYYY-MM-DD") + "T00:00:00.000Z";
  }

  return dayjs(closest).format("YYYY-MM-DD") + "T00:00:00.000Z";
}

export function getTermFromDate(terms: Term[], date: string) {
  return terms.find((term) => dayjs(date).isBetween(term.start, term.end));
}

export function getCurrentTermForDate(terms: Term[], date: Date): Term {
  for (let i = 0; i < terms.length; i++) {
    if (
      dayjs(date).isBetween(terms[i].start, terms[i].end, "day", "[]") ||
      (terms[i - 1] &&
        dayjs(date).isBetween(terms[i - 1].end, terms[i].start, "day", "[]"))
    ) {
      return terms[i];
    }
  }

  return terms[0];
}

export function isEditorEmpty(reportState: EditorState) {
  return reportState.read(() => {
    const root = $getRoot();

    const isEmpty =
      !root.getFirstChild<RootNode>() ||
      (root.getFirstChild<RootNode>()?.isEmpty() &&
        root.getChildrenSize() === 1);

    return isEmpty;
  });
}

export function getSelectedTerm(
  terms: Term[],
  selectedTermYear: string,
  selectedTermId: string | null,
  selectedTermDate: string | null,
) {
  if (selectedTermDate !== null && selectedTermDate.trim() !== "") {
    const termYear = dayjs(selectedTermDate).year();

    const termsForYear = terms.filter(({ year }) => year === termYear);

    const selectedTerm = termsForYear.find(({ start, end }) =>
      dayjs(selectedTermDate).isBetween(start, end),
    )!;

    return {
      selectedTerm,
      termsForYear,
    };
  }

  const CURRENT_YEAR = dayjs().year().toString();

  if (selectedTermId !== null && selectedTermId.trim() !== "") {
    const selectedTerm = terms.find((t) => t.id.toString() === selectedTermId);
    if (selectedTerm !== undefined) {
      const termsForYear = terms.filter(
        ({ year }) => year === selectedTerm.year,
      );

      return {
        selectedTerm,
        termsForYear,
      };
    }

    const termsForYear = terms.filter(
      ({ year }) => year.toString() === selectedTermYear,
    );

    return {
      selectedTerm:
        selectedTermYear === CURRENT_YEAR
          ? getCurrentTermForDate(terms, new Date())
          : termsForYear[0],
      termsForYear,
    };
  }

  return {
    selectedTerm: getCurrentTermForDate(terms, new Date()),
    termsForYear: terms.filter(({ year }) => year.toString() === CURRENT_YEAR),
  };
}

export function getDistinctTermYears(terms: Term[]) {
  return Array.from(new Set(terms.map(({ year }) => year)));
}

export class URLSafeSearch extends URL {
  readonly safeSearchParams = new SafeURLSearchParams(this.search);
}

class SafeURLSearchParams extends URLSearchParams {
  getNullOrEmpty(name: string): string | null {
    const value = this.get(name);

    return isStringNullOrEmpty(value) ? null : value;
  }
}
