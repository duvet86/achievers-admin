-- AlterTable
RENAME TABLE SessionAttendance TO Session;

SET FOREIGN_KEY_CHECKS=0;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `SessionAttendance_chapterId_fkey`;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `SessionAttendance_mentorSessionId_fkey`;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `SessionAttendance_studentSessionId_fkey`;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_mentorSessionId_fkey` FOREIGN KEY (`mentorSessionId`) REFERENCES `MentorSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_studentSessionId_fkey` FOREIGN KEY (`studentSessionId`) REFERENCES `StudentSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Session` RENAME INDEX `SessionAttendance_chapterId_mentorSessionId_studentSessionId_key` TO `Session_chapterId_mentorSessionId_studentSessionId_key`;

SET FOREIGN_KEY_CHECKS=1;