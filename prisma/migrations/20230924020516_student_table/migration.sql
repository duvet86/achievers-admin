-- CreateTable
CREATE TABLE `Student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `allergies` BOOLEAN NOT NULL DEFAULT false,
    `hasApprovedToPublishPhotos` BOOLEAN NOT NULL DEFAULT false,
    `bestPersonToContact` VARCHAR(191) NOT NULL,
    `bestContactMethod` VARCHAR(191) NOT NULL,
    `schoolName` VARCHAR(191) NOT NULL,
    `yearLevel` VARCHAR(191) NOT NULL,
    `emergencyContactFullName` VARCHAR(191) NOT NULL,
    `emergencyContactRelationship` VARCHAR(191) NOT NULL,
    `emergencyContactPhone` VARCHAR(191) NOT NULL,
    `emergencyContactEmail` VARCHAR(191) NOT NULL,
    `emergencyContactAddress` VARCHAR(191) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentGuardian` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(191) NOT NULL,
    `relationship` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `studentId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentTeacher` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `schoolName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `studentId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentAtChapter` (
    `chapterId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `assignedBy` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`chapterId`, `studentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StudentGuardian` ADD CONSTRAINT `StudentGuardian_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentTeacher` ADD CONSTRAINT `StudentTeacher_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAtChapter` ADD CONSTRAINT `StudentAtChapter_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentAtChapter` ADD CONSTRAINT `StudentAtChapter_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
