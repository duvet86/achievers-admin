export function isStringNullOrEmpty(value: string | null | undefined): boolean {
  return value === undefined || value === null || value.trim() === "";
}
