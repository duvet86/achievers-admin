export async function readFormDataAsStringsAsync(
  request: Request
): Promise<Record<string, string | undefined>> {
  const formData = await request.formData();

  return Object.entries(Object.fromEntries(formData)).reduce<
    Record<string, string>
  >((res, [key, value]) => {
    res[key] = value?.toString().trim();

    return res;
  }, {});
}
