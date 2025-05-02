-- DropForeignKey
ALTER TABLE `StudentGuardian` DROP FOREIGN KEY `StudentGuardian_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `StudentTeacher` DROP FOREIGN KEY `StudentTeacher_studentId_fkey`;

-- DropIndex
DROP INDEX `StudentGuardian_studentId_fkey` ON `StudentGuardian`;

-- DropIndex
DROP INDEX `StudentTeacher_studentId_fkey` ON `StudentTeacher`;

-- AlterTable
ALTER TABLE `Student` ADD COLUMN `eoiStudentProfileId` INTEGER NULL;

-- AlterTable
ALTER TABLE `StudentGuardian` ADD COLUMN `eoiStudentProfileId` INTEGER NULL,
    ADD COLUMN `preferredName` VARCHAR(191) NULL,
    MODIFY `studentId` INTEGER NULL;

-- AlterTable
ALTER TABLE `StudentTeacher` ADD COLUMN `eoiStudentProfileId` INTEGER NULL,
    ADD COLUMN `subject` ENUM('MATH', 'ENGLISH') NULL,
    MODIFY `studentId` INTEGER NULL;

-- CreateTable
CREATE TABLE `EoiStudentProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `preferredName` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `dietaryRequirements` VARCHAR(191) NOT NULL,
    `isEnglishMainLanguage` BOOLEAN NOT NULL,
    `otherLanguagesSpoken` VARCHAR(191) NOT NULL,
    `bestPersonToContact` VARCHAR(191) NOT NULL,
    `bestPersonToContactForEmergency` VARCHAR(191) NOT NULL,
    `yearLevel` VARCHAR(191) NOT NULL,
    `favouriteSchoolSubject` VARCHAR(191) NOT NULL,
    `leastFavouriteSchoolSubject` VARCHAR(191) NOT NULL,
    `supportReason` VARCHAR(191) NOT NULL,
    `otherSupport` VARCHAR(191) NOT NULL,
    `alreadyInAchievers` VARCHAR(191) NOT NULL,
    `heardAboutUs` VARCHAR(191) NOT NULL,
    `preferredChapter` VARCHAR(191) NOT NULL,
    `weeklyCommitment` BOOLEAN NOT NULL,
    `hasApprovedToPublishPhotos` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Student_eoiStudentProfileId_key` ON `Student`(`eoiStudentProfileId`);

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_eoiStudentProfileId_fkey` FOREIGN KEY (`eoiStudentProfileId`) REFERENCES `EoiStudentProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentGuardian` ADD CONSTRAINT `StudentGuardian_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentGuardian` ADD CONSTRAINT `StudentGuardian_eoiStudentProfileId_fkey` FOREIGN KEY (`eoiStudentProfileId`) REFERENCES `EoiStudentProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentTeacher` ADD CONSTRAINT `StudentTeacher_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentTeacher` ADD CONSTRAINT `StudentTeacher_eoiStudentProfileId_fkey` FOREIGN KEY (`eoiStudentProfileId`) REFERENCES `EoiStudentProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
