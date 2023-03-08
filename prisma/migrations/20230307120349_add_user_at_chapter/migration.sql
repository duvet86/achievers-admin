/*
  Warnings:

  - You are about to drop the column `chapterId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `User_chapterId_fkey` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `chapterId`;

-- CreateTable
CREATE TABLE `UserAtChapter` (
    `userId` VARCHAR(191) NOT NULL,
    `chapterId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `assignedBy` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`userId`, `chapterId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserAtChapter` ADD CONSTRAINT `UserAtChapter_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
