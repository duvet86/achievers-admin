/*
  Warnings:

  - You are about to drop the `MentoringStudent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAtChapter` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `MentoringStudent` DROP FOREIGN KEY `MentoringStudent_chapterId_fkey`;

-- DropForeignKey
ALTER TABLE `MentoringStudent` DROP FOREIGN KEY `MentoringStudent_menteeId_fkey`;

-- DropForeignKey
ALTER TABLE `UserAtChapter` DROP FOREIGN KEY `UserAtChapter_chapterId_fkey`;

-- AlterTable
ALTER TABLE `Mentee` ADD COLUMN `chapterId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `chapterId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `MentoringStudent`;

-- DropTable
DROP TABLE `UserAtChapter`;

-- CreateTable
CREATE TABLE `MentoringMentee` (
    `userId` VARCHAR(191) NOT NULL,
    `menteeId` VARCHAR(191) NOT NULL,
    `chapterId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `assignedBy` VARCHAR(191) NOT NULL,
    `frequencyInDays` INTEGER NOT NULL,
    `startDate` DATETIME(3) NULL,

    PRIMARY KEY (`userId`, `menteeId`, `chapterId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mentee` ADD CONSTRAINT `Mentee_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentoringMentee` ADD CONSTRAINT `MentoringMentee_menteeId_fkey` FOREIGN KEY (`menteeId`) REFERENCES `Mentee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentoringMentee` ADD CONSTRAINT `MentoringMentee_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
