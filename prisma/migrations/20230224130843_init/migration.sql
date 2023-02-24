-- CreateTable
CREATE TABLE `Roles` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,

    UNIQUE INDEX `Roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `additionalEmail` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `isOver18` BOOLEAN NOT NULL,
    `isPublishPhotoApproved` BOOLEAN NOT NULL,
    `isApprovedByMRC` BOOLEAN NOT NULL,
    `isCommiteeMemeber` BOOLEAN NOT NULL,
    `isCurrentMemeber` BOOLEAN NOT NULL,
    `inductionDate` DATETIME(3) NOT NULL,
    `isActiveMentor` BOOLEAN NOT NULL,
    `attendance` ENUM('Weekly', 'Fortnightly', 'Other') NULL,
    `vaccinationStatus` ENUM('Confirmed', 'Uncofirmed') NULL,
    `policeCheckRenewalDate` DATETIME(3) NOT NULL,
    `WWCCheckRenewalDate` DATETIME(3) NOT NULL,
    `WWCCheckNumber` VARCHAR(191) NOT NULL,
    `isVolunteerAgreementComplete` BOOLEAN NOT NULL,
    `isBoardMemeber` BOOLEAN NOT NULL,
    `emergencyContactName` VARCHAR(191) NOT NULL,
    `emergencyContactNumber` VARCHAR(191) NOT NULL,
    `emergencyContactAddress` VARCHAR(191) NOT NULL,
    `emergencyContactRelationship` VARCHAR(191) NOT NULL,
    `occupation` VARCHAR(191) NULL,
    `boardTermExpiryDate` DATETIME(3) NULL,
    `directorIdentificationNumber` VARCHAR(191) NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_additionalEmail_key`(`additionalEmail`),
    UNIQUE INDEX `User_firstName_lastName_key`(`firstName`, `lastName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mentee` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `yearLevel` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Mentee_firstName_lastName_key`(`firstName`, `lastName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chapter` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Chapter_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserAtChapter` (
    `userId` VARCHAR(191) NOT NULL,
    `chapterId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `assignedBy` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`userId`, `chapterId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MentoringStudent` (
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
ALTER TABLE `Roles` ADD CONSTRAINT `Roles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAtChapter` ADD CONSTRAINT `UserAtChapter_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAtChapter` ADD CONSTRAINT `UserAtChapter_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentoringStudent` ADD CONSTRAINT `MentoringStudent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentoringStudent` ADD CONSTRAINT `MentoringStudent_menteeId_fkey` FOREIGN KEY (`menteeId`) REFERENCES `Mentee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentoringStudent` ADD CONSTRAINT `MentoringStudent_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
