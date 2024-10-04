import { prisma } from "~/db.server";

export function getRoleMappings(
  chapterMappings: Record<string, string>,
  azureRole: string,
) {
  const split = azureRole.split(".");
  const chapterId = split.length > 3 ? split[2] : null;

  const chapterName = chapterId ? `at "${chapterMappings[chapterId]}"` : "";

  return `${split[0]} ${chapterName}`;
}

export async function getChaptersLookupAsync() {
  const chapters = await prisma.chapter.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  return chapters.reduce<Record<string, string>>((res, { id, name }) => {
    res[id] = name;

    return res;
  }, {});
}
