/*
  Warnings:

  - You are about to drop the `studentatchapter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `useratchapter` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `chapterId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chapterId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `StudentAtChapter` DROP FOREIGN KEY `StudentAtChapter_chapterId_fkey`;

-- DropForeignKey
ALTER TABLE `StudentAtChapter` DROP FOREIGN KEY `StudentAtChapter_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `UserAtChapter` DROP FOREIGN KEY `UserAtChapter_chapterId_fkey`;

-- DropForeignKey
ALTER TABLE `UserAtChapter` DROP FOREIGN KEY `UserAtChapter_userId_fkey`;

-- AlterTable
ALTER TABLE `Student` ADD COLUMN `chapterId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `chapterId` INTEGER NOT NULL;

-- Migrate data
UPDATE `User` u LEFT JOIN `UserAtChapter` c ON c.userId = u.id SET u.chapterId = COALESCE(c.chapterId, 1);

UPDATE `Student` s LEFT JOIN `StudentAtChapter` c ON c.studentId = s.id SET s.chapterId = COALESCE(c.chapterId, 1);

-- DropTable
DROP TABLE `StudentAtChapter`;

-- DropTable
DROP TABLE `UserAtChapter`;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
