-- AlterTable
ALTER TABLE `Mentor`
    ADD COLUMN `status` ENUM('ARCHIVED', 'BLOCKED') NULL;

-- CreateTable
CREATE TABLE `MentorNote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `note` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `mentorId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MentorNote` ADD CONSTRAINT `MentorNote_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `Mentor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Migrate endReason to notes.
INSERT INTO MentorNote (note, mentorId, updatedAt)
SELECT endReason, id, NOW() FROM Mentor WHERE endReason IS NOT NULL;

-- AlterTable
ALTER TABLE `Mentor`
    DROP COLUMN `endReason`;