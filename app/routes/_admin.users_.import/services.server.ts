import type { SpeadsheetUser } from "~/models/speadsheet";
import type { Prisma } from "@prisma/client";

import { Readable } from "stream";

import { stream, read, utils } from "xlsx";
import { prisma } from "~/db.server";

export async function readExcelFileAsync(file: File) {
  stream.set_readable(Readable);

  const workbook = read(await file.arrayBuffer());
  const firstWs = workbook.Sheets[workbook.SheetNames[0]];

  const sheetUsers = utils.sheet_to_json<SpeadsheetUser>(firstWs);

  return sheetUsers;
}

export async function createManyUsersAsync(
  newUsers: Prisma.XOR<
    Prisma.UserCreateInput,
    Prisma.UserUncheckedCreateInput
  >[]
) {
  await prisma.$transaction(
    newUsers.map((newUser) =>
      prisma.user.create({
        data: newUser,
      })
    )
  );
}

export async function createManyUsersAtChaptersAsync(
  data: Prisma.UserAtChapterCreateManyInput[]
) {
  return await prisma.userAtChapter.createMany({
    data,
  });
}

export async function getChaptersAsync() {
  return await prisma.chapter.findMany({
    select: {
      id: true,
      name: true,
    },
  });
}
