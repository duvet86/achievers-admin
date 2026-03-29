import { prisma } from "~/db.server";

export async function getMentorResourcesAsync() {
  return await prisma.mentorResourceCategory.findMany({
    select: {
      id: true,
      label: true,
      mentorResource: {
        select: {
          id: true,
          label: true,
          description: true,
          url: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });
}
