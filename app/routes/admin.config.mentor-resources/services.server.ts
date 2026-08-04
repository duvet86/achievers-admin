import { prisma } from "~/db.server";

export interface CategoryOrderCommand {
  id: number;
  order: number;
}

export async function getMentorResourcesAsync() {
  return await prisma.mentorResourceCategory.findMany({
    select: {
      id: true,
      label: true,
      _count: {
        select: {
          mentorResource: true,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });
}

export async function updateCategoryOrder(
  categoryOrders: CategoryOrderCommand[],
) {
  await prisma.$transaction(async (tx) => {
    const updatePromises = categoryOrders.map(({ id, order }) =>
      tx.mentorResourceCategory.update({
        where: {
          id,
        },
        data: {
          order,
        },
      }),
    );

    await Promise.all(updatePromises);
  });
}
