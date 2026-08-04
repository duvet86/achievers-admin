import { prisma } from "~/db.server";

export interface ResourceCommand {
  id: number;
  label: string;
  mentorResource: {
    id: number;
    label: string;
    description: string | null;
    order: number;
    url: string;
  }[];
}

export async function getMentorResourceByIdAsync(resourceId: number) {
  return await prisma.mentorResourceCategory.findUniqueOrThrow({
    where: {
      id: resourceId,
    },
    select: {
      id: true,
      label: true,
      mentorResource: {
        select: {
          id: true,
          label: true,
          description: true,
          url: true,
          order: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });
}

export async function upsertMentorResourcesAsync(
  resourceId: number,
  resource: ResourceCommand,
) {
  return await prisma.$transaction(async (tx) => {
    const upsertedCategory = await tx.mentorResourceCategory.upsert({
      where: { id: resourceId },
      update: { label: resource.label },
      create: {
        label: resource.label,
        order: (await tx.mentorResourceCategory.count()) + 1,
      },
      select: {
        id: true,
      },
    });

    await Promise.all(
      resource.mentorResource.map((item) =>
        tx.mentorResource.upsert({
          where: { id: item.id },
          update: {
            label: item.label,
            description: item.description,
            url: item.url,
            order: item.order,
          },
          create: {
            label: item.label,
            description: item.description,
            url: item.url,
            order: item.order,
            mentorResourceCategoryId: upsertedCategory.id,
          },
        }),
      ),
    );

    return upsertedCategory;
  });
}
