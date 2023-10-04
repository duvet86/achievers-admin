import type { Environment } from "./models";

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
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}

export function isStringNullOrEmpty(
  value: string | null | undefined,
): value is null | undefined {
  return value === undefined || value === null || value.trim() === "";
}

export function isEmail(email: string) {
  return email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
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
