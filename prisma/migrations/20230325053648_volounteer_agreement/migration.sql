-- AlterTable
ALTER TABLE `user` ADD COLUMN `hasApprovedToPublishPhotos` BOOLEAN NULL,
    ADD COLUMN `nextOfKinAddress` VARCHAR(191) NULL,
    ADD COLUMN `nextOfKinName` VARCHAR(191) NULL,
    ADD COLUMN `nextOfKinNumber` VARCHAR(191) NULL,
    ADD COLUMN `nextOfKinRelationship` VARCHAR(191) NULL;

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

-- AddForeignKey
ALTER TABLE `VolunteerAgreement` ADD CONSTRAINT `VolunteerAgreement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
