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
    `isPublishPhotoApproved` BOOLEAN NOT NULL,
    `isApprovedByMRC` BOOLEAN NOT NULL,
    `isBoardMemeber` BOOLEAN NOT NULL DEFAULT false,
    `isCommiteeMemeber` BOOLEAN NOT NULL DEFAULT false,
    `isCurrentMemeber` BOOLEAN NOT NULL DEFAULT false,
    `inductionDate` DATETIME(3) NULL,
    `defaultAttendance` ENUM('Weekly', 'Fortnightly', 'Other') NULL,
    `vaccinationStatus` ENUM('Confirmed', 'Uncofirmed') NULL,
    `policeCheckRenewalDate` DATETIME(3) NULL,
    `WWCCheckRenewalDate` DATETIME(3) NULL,
    `WWCCheckNumber` VARCHAR(191) NULL,
    `isVolunteerAgreementComplete` BOOLEAN NOT NULL,
    `emergencyContactName` VARCHAR(191) NOT NULL,
    `emergencyContactNumber` VARCHAR(191) NOT NULL,
    `emergencyContactAddress` VARCHAR(191) NOT NULL,
    `emergencyContactRelationship` VARCHAR(191) NOT NULL,
    `occupation` VARCHAR(191) NULL,
    `boardTermExpiryDate` DATETIME(3) NULL,
    `directorIdentificationNumber` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `endDate` DATETIME(3) NULL,
    `profilePicturePath` VARCHAR(191) NULL,
    `policeCheckPath` VARCHAR(191) NULL,
    `WWCCheckPath` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_firstName_lastName_key`(`firstName`, `lastName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserEOIForm` (
    `id` VARCHAR(191) NOT NULL,
    `bestTimeToContact` VARCHAR(191) NOT NULL,
    `occupation` VARCHAR(191) NOT NULL,
    `volunteerExperience` VARCHAR(191) NOT NULL,
    `interestedInRole` VARCHAR(191) NOT NULL,
    `mentoringLevel` VARCHAR(191) NOT NULL,
    `hearAboutUs` VARCHAR(191) NOT NULL,
    `mentorOrVolunteer` VARCHAR(191) NOT NULL,
    `preferredLocation` VARCHAR(191) NOT NULL,
    `preferredFrequency` VARCHAR(191) NOT NULL,
    `isOver18` BOOLEAN NOT NULL,
    `referee1FirstName` VARCHAR(191) NOT NULL,
    `referee1Surname` VARCHAR(191) NOT NULL,
    `referee1Mobile` VARCHAR(191) NOT NULL,
    `referee1Email` VARCHAR(191) NOT NULL,
    `referee1BestTimeToContact` VARCHAR(191) NOT NULL,
    `referee1Relationship` VARCHAR(191) NOT NULL,
    `referee2FirstName` VARCHAR(191) NOT NULL,
    `referee2Surname` VARCHAR(191) NOT NULL,
    `referee2Mobile` VARCHAR(191) NOT NULL,
    `referee2Email` VARCHAR(191) NOT NULL,
    `referee2BestTimeToContact` VARCHAR(191) NOT NULL,
    `referee2Relationship` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,

    UNIQUE INDEX `UserEOIForm_userId_key`(`userId`),
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
CREATE TABLE `UserAtChapter` (
    `userId` VARCHAR(191) NOT NULL,
    `chapterId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `assignedBy` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`userId`, `chapterId`)
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
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`userId`, `menteeId`, `chapterId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserEOIForm` ADD CONSTRAINT `UserEOIForm_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mentee` ADD CONSTRAINT `Mentee_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAtChapter` ADD CONSTRAINT `UserAtChapter_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentoringMentee` ADD CONSTRAINT `MentoringMentee_menteeId_fkey` FOREIGN KEY (`menteeId`) REFERENCES `Mentee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentoringMentee` ADD CONSTRAINT `MentoringMentee_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
