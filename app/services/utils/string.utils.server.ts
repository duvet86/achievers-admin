export function isStringNullOrEmpty(
  value: string | null | undefined
): value is null | undefined {
  return value === undefined || value === null || value.trim() === "";
}

export function isEmail(email: string) {
  return email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
}

export function getExtension(fileName: string): string {
  const fileNameSplit = fileName.split(".");

  return fileNameSplit[fileNameSplit.length - 1];
}
