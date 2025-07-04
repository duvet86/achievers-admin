import type { Prisma, PrismaClient } from "~/prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export async function mentorAsync(
  tx: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >,
) {
  const { id } = await tx.mentor.findUniqueOrThrow({
    where: {
      email: "test_0@test.com",
    },
    select: {
      id: true,
    },
  });

  await tx.mentor.update({
    where: {
      id,
    },
    data: {
      firstName: "Luca",
      lastName: "Mara",
      mobile: "1111111",
      addressStreet: "Address street",
      addressSuburb: "Address suburb",
      addressState: "Address state",
      addressPostcode: "Address postcode",
      dateOfBirth: new Date("1986-07-22T01:44:13.938Z"),
      emergencyContactName: "Luca",
      emergencyContactNumber: "Luca",
      emergencyContactAddress: "Luca",
      emergencyContactRelationship: "Luca",
      volunteerAgreementSignedOn: new Date(),
    },
  });
}
