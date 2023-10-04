-- AlterTable
ALTER TABLE `User` ADD COLUMN `frequencyInDays` INTEGER NULL;

-- CreateTable
CREATE TABLE `MentorToStudentAssignement` (
    `userId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `assignedBy` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`userId`, `studentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MentorToStudentSession` (
    `userId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `chapterId` INTEGER NOT NULL,
    `attendedOn` DATETIME(3) NOT NULL,
    `report` TEXT NULL,

    PRIMARY KEY (`userId`, `studentId`, `chapterId`, `attendedOn`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MentorToStudentAssignement` ADD CONSTRAINT `MentorToStudentAssignement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorToStudentAssignement` ADD CONSTRAINT `MentorToStudentAssignement_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorToStudentSession` ADD CONSTRAINT `MentorToStudentSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorToStudentSession` ADD CONSTRAINT `MentorToStudentSession_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorToStudentSession` ADD CONSTRAINT `MentorToStudentSession_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Migrate Data ------------------------------------------------------------------------
UPDATE `User` u
INNER JOIN `EoIProfile` p ON p.userId = u.id
SET frequencyInDays = IF(p.preferredFrequency = 'Every week', 7, 14);