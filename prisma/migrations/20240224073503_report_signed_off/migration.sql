-- AlterTable
ALTER TABLE `MentorToStudentSession` ADD COLUMN `signedOffByAzureId` VARCHAR(191) NULL,
    ADD COLUMN `signedOffOn` DATETIME(3) NULL;
