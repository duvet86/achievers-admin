-- CreateTable
CREATE TABLE `Session` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `azureADId` VARCHAR(191) NOT NULL,
    `accessToken` LONGTEXT NOT NULL,
    `refreshToken` LONGTEXT NOT NULL,
    `expiresIn` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_azureADId_key`(`azureADId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `azureADId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NOT NULL,
    `addressStreet` VARCHAR(191) NOT NULL,
    `addressSuburb` VARCHAR(191) NOT NULL,
    `addressState` VARCHAR(191) NOT NULL,
    `addressPostcode` VARCHAR(191) NOT NULL,
    `additionalEmail` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `emergencyContactName` VARCHAR(191) NULL,
    `emergencyContactNumber` VARCHAR(191) NULL,
    `emergencyContactAddress` VARCHAR(191) NULL,
    `emergencyContactRelationship` VARCHAR(191) NULL,
    `nextOfKinName` VARCHAR(191) NULL,
    `nextOfKinNumber` VARCHAR(191) NULL,
    `nextOfKinAddress` VARCHAR(191) NULL,
    `nextOfKinRelationship` VARCHAR(191) NULL,
    `profilePicturePath` VARCHAR(191) NULL,
    `hasApprovedToPublishPhotos` BOOLEAN NULL,
    `endDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `chapterId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_azureADId_key`(`azureADId`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EoIProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bestTimeToContact` VARCHAR(191) NOT NULL,
    `occupation` VARCHAR(191) NOT NULL,
    `volunteerExperience` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `mentoringLevel` VARCHAR(191) NOT NULL,
    `heardAboutUs` VARCHAR(191) NOT NULL,
    `preferredFrequency` VARCHAR(191) NOT NULL,
    `isOver18` BOOLEAN NOT NULL,
    `comment` TEXT NOT NULL,
    `aboutMe` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `EoIProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WelcomeCall` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `calledBy` VARCHAR(191) NOT NULL,
    `calledOnDate` DATETIME(3) NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `WelcomeCall_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reference` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `bestTimeToContact` VARCHAR(191) NOT NULL,
    `relationship` VARCHAR(191) NOT NULL,
    `generalComment` TEXT NULL,
    `outcomeComment` TEXT NULL,
    `hasKnowApplicantForAYear` BOOLEAN NULL,
    `isRelated` BOOLEAN NULL,
    `isMentorRecommended` BOOLEAN NULL,
    `calledBy` VARCHAR(191) NULL,
    `calledOndate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Induction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `runBy` VARCHAR(191) NOT NULL,
    `completedOnDate` DATETIME(3) NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `Induction_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VolunteerAgreement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isInformedOfConstitution` BOOLEAN NOT NULL,
    `hasApprovedSafetyDirections` BOOLEAN NOT NULL,
    `hasAcceptedNoLegalResp` BOOLEAN NOT NULL,
    `signedOn` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `VolunteerAgreement_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PoliceCheck` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filePath` VARCHAR(191) NOT NULL,
    `expiryDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `PoliceCheck_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WWCCheck` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wwcNumber` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `expiryDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `WWCCheck_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApprovalbyMRC` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `completedBy` VARCHAR(191) NOT NULL,
    `submittedDate` DATETIME(3) NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `ApprovalbyMRC_userId_key`(`userId`),
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

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EoIProfile` ADD CONSTRAINT `EoIProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WelcomeCall` ADD CONSTRAINT `WelcomeCall_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reference` ADD CONSTRAINT `Reference_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Induction` ADD CONSTRAINT `Induction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VolunteerAgreement` ADD CONSTRAINT `VolunteerAgreement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoliceCheck` ADD CONSTRAINT `PoliceCheck_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WWCCheck` ADD CONSTRAINT `WWCCheck_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalbyMRC` ADD CONSTRAINT `ApprovalbyMRC_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
