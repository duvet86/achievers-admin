-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `accessToken` LONGTEXT NOT NULL,
    `refreshToken` LONGTEXT NOT NULL,
    `expiresIn` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `additionalEmail` VARCHAR(191) NULL,
    `mobile` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `isOver18` BOOLEAN NOT NULL,
    `isPublishPhotoApproved` BOOLEAN NOT NULL,
    `isApprovedByMRC` BOOLEAN NOT NULL,
    `isCommiteeMemeber` BOOLEAN NOT NULL DEFAULT false,
    `isCurrentMemeber` BOOLEAN NOT NULL DEFAULT true,
    `inductionDate` DATETIME(3) NULL,
    `isActiveMentor` BOOLEAN NOT NULL DEFAULT true,
    `attendance` ENUM('Weekly', 'Fortnightly', 'Other') NULL,
    `vaccinationStatus` ENUM('Confirmed', 'Uncofirmed') NULL,
    `policeCheckRenewalDate` DATETIME(3) NULL,
    `WWCCheckRenewalDate` DATETIME(3) NULL,
    `WWCCheckNumber` VARCHAR(191) NULL,
    `isVolunteerAgreementComplete` BOOLEAN NOT NULL,
    `isBoardMemeber` BOOLEAN NOT NULL DEFAULT false,
    `emergencyContactName` VARCHAR(191) NOT NULL,
    `emergencyContactNumber` VARCHAR(191) NOT NULL,
    `emergencyContactAddress` VARCHAR(191) NOT NULL,
    `emergencyContactRelationship` VARCHAR(191) NOT NULL,
    `occupation` VARCHAR(191) NULL,
    `boardTermExpiryDate` DATETIME(3) NULL,
    `directorIdentificationNumber` VARCHAR(191) NULL,
    `endDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `chapterId` VARCHAR(191) NULL,

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
    `chapterId` VARCHAR(191) NULL,

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
