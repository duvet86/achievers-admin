-- AlterTable
RENAME TABLE User TO Mentor;

SET FOREIGN_KEY_CHECKS=0;

-- DropForeignKey
ALTER TABLE `ApprovalbyMRC` DROP FOREIGN KEY `ApprovalbyMRC_userId_fkey`;

-- DropForeignKey
ALTER TABLE `EoIProfile` DROP FOREIGN KEY `EoIProfile_userId_fkey`;

-- DropForeignKey
ALTER TABLE `ImportedHistory` DROP FOREIGN KEY `ImportedHistory_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Induction` DROP FOREIGN KEY `Induction_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Mentor` DROP FOREIGN KEY `User_chapterId_fkey`;

-- DropForeignKey
ALTER TABLE `MentorAttendance` DROP FOREIGN KEY `MentorAttendance_chapterId_fkey`;

-- DropForeignKey
ALTER TABLE `MentorAttendance` DROP FOREIGN KEY `MentorAttendance_userId_fkey`;

-- DropForeignKey
ALTER TABLE `MentorToStudentAssignement` DROP FOREIGN KEY `MentorToStudentAssignement_userId_fkey`;

-- DropForeignKey
ALTER TABLE `PoliceCheck` DROP FOREIGN KEY `PoliceCheck_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Reference` DROP FOREIGN KEY `Reference_userId_fkey`;

-- DropForeignKey
ALTER TABLE `WelcomeCall` DROP FOREIGN KEY `WelcomeCall_userId_fkey`;

-- DropForeignKey
ALTER TABLE `WWCCheck` DROP FOREIGN KEY `WWCCheck_userId_fkey`;

-- DropIndex
DROP INDEX `ApprovalbyMRC_userId_key` ON `ApprovalbyMRC`;

-- DropIndex
DROP INDEX `EoIProfile_userId_key` ON `EoIProfile`;

-- DropIndex
DROP INDEX `ImportedHistory_userId_key` ON `ImportedHistory`;

-- DropIndex
DROP INDEX `Induction_userId_key` ON `Induction`;

-- DropIndex
DROP INDEX `MentorAttendance_chapterId_userId_attendedOn_key` ON `MentorAttendance`;

-- DropIndex
DROP INDEX `MentorAttendance_userId_fkey` ON `MentorAttendance`;

-- DropIndex
DROP INDEX `MentorToStudentAssignement_userId_studentId_key` ON `MentorToStudentAssignement`;

-- DropIndex
DROP INDEX `PoliceCheck_userId_key` ON `PoliceCheck`;

-- DropIndex
DROP INDEX `Reference_userId_fkey` ON `Reference`;

-- DropIndex
DROP INDEX `WelcomeCall_userId_key` ON `WelcomeCall`;

-- DropIndex
DROP INDEX `WWCCheck_userId_key` ON `WWCCheck`;

-- AlterTable
ALTER TABLE `ApprovalbyMRC` RENAME COLUMN `userId` TO `mentorId`;

-- AlterTable
ALTER TABLE `EoIProfile` RENAME COLUMN `userId` TO `mentorId`;

-- AlterTable
ALTER TABLE `ImportedHistory` RENAME COLUMN `userId` TO `mentorId`;

-- AlterTable
ALTER TABLE `Induction` RENAME COLUMN `userId` TO `mentorId`;

-- AlterTable
ALTER TABLE `MentorAttendance` RENAME COLUMN `userId` TO `mentorId`;

-- AlterTable
ALTER TABLE `MentorToStudentAssignement` RENAME COLUMN `userId` TO `mentorId`;

-- AlterTable
ALTER TABLE `PoliceCheck` RENAME COLUMN `userId` TO `mentorId`;

-- AlterTable
ALTER TABLE `Reference` RENAME COLUMN `userId` TO `mentorId`;

-- AlterTable
ALTER TABLE `WelcomeCall` RENAME COLUMN `userId` TO `mentorId`;

-- AlterTable
ALTER TABLE `WWCCheck` RENAME COLUMN `userId` TO `mentorId`;

-- CreateIndex
CREATE UNIQUE INDEX `ApprovalbyMRC_mentorId_key` ON `ApprovalbyMRC`(`mentorId`);

-- CreateIndex
CREATE UNIQUE INDEX `EoIProfile_mentorId_key` ON `EoIProfile`(`mentorId`);

-- CreateIndex
CREATE UNIQUE INDEX `ImportedHistory_mentorId_key` ON `ImportedHistory`(`mentorId`);

-- CreateIndex
CREATE UNIQUE INDEX `Induction_mentorId_key` ON `Induction`(`mentorId`);

-- CreateIndex
CREATE UNIQUE INDEX `MentorAttendance_chapterId_mentorId_attendedOn_key` ON `MentorAttendance`(`chapterId`, `mentorId`, `attendedOn`);

-- CreateIndex
CREATE UNIQUE INDEX `MentorToStudentAssignement_mentorId_studentId_key` ON `MentorToStudentAssignement`(`mentorId`, `studentId`);

-- CreateIndex
CREATE UNIQUE INDEX `PoliceCheck_mentorId_key` ON `PoliceCheck`(`mentorId`);

-- CreateIndex
CREATE UNIQUE INDEX `WelcomeCall_mentorId_key` ON `WelcomeCall`(`mentorId`);

-- CreateIndex
CREATE UNIQUE INDEX `WWCCheck_mentorId_key` ON `WWCCheck`(`mentorId`);

-- AddForeignKey
ALTER TABLE `Mentor` ADD CONSTRAINT `Mentor_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImportedHistory` ADD CONSTRAINT `ImportedHistory_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `Mentor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EoIProfile` ADD CONSTRAINT `EoIProfile_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `Mentor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WelcomeCall` ADD CONSTRAINT `WelcomeCall_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `Mentor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reference` ADD CONSTRAINT `Reference_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `Mentor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Induction` ADD CONSTRAINT `Induction_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `Mentor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoliceCheck` ADD CONSTRAINT `PoliceCheck_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `Mentor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WWCCheck` ADD CONSTRAINT `WWCCheck_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `Mentor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalbyMRC` ADD CONSTRAINT `ApprovalbyMRC_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `Mentor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorToStudentAssignement` ADD CONSTRAINT `MentorToStudentAssignement_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `Mentor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorAttendance` ADD CONSTRAINT `MentorAttendance_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `Mentor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Mentor` RENAME INDEX `User_azureADId_key` TO `Mentor_azureADId_key`;

-- RenameIndex
ALTER TABLE `Mentor` RENAME INDEX `User_email_key` TO `Mentor_email_key`;

SET FOREIGN_KEY_CHECKS=1;