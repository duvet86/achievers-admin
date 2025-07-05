-- AddForeignKey
ALTER TABLE `MentorAttendance` ADD CONSTRAINT `MentorAttendance_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `Session` RENAME COLUMN `cancelledReason` TO `cancelledExtendedReason`;

ALTER TABLE `Session`
    ADD COLUMN `cancelledBecauseOf` ENUM('MENTOR', 'STUDENT') NULL,
    ADD COLUMN `cancelledReasonId` INTEGER NULL;

-- CreateTable
CREATE TABLE `SessionCancelledReason` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reason` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Session_cancelledReasonId_key` ON `Session`(`cancelledReasonId`);

-- CreateIndex
CREATE UNIQUE INDEX `SessionCancelledReason_reason_key` ON `SessionCancelledReason`(`reason`);

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_cancelledReasonId_fkey`
FOREIGN KEY (`cancelledReasonId`) REFERENCES `SessionCancelledReason`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;