import { prisma } from "~/db.server";

export async function getMentorResourcesAsync() {
  return await prisma.mentorResourceCategory.findMany({
    select: {
      id: true,
      label: true,
      mentorResource: {
        select: {
          id: true,
          order: true,
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

export async function updateCategory(categoryId: number, label: string) {
  return await prisma.mentorResourceCategory.update({
    where: {
      id: categoryId,
    },
    data: {
      label,
    },
  });
}

export async function updateResource(
  resourceId: number,
  label: string,
  url: string,
) {
  return await prisma.mentorResource.update({
    where: {
      id: resourceId,
    },
    data: {
      label,
      url,
    },
  });
}

export async function addResource(
  categoryId: number,
  label: string,
  url: string,
  order: number,
) {
  return await prisma.mentorResource.create({
    data: {
      mentorResourceCategoryId: categoryId,
      order,
      label,
      url,
    },
  });
}
