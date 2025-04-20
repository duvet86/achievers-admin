-- CreateTable
CREATE TABLE `MentorShareInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mentorSharingId` INTEGER NOT NULL,
    `mentorSharedToId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MentorShareInfo_mentorSharingId_mentorSharedToId_key`(`mentorSharingId`, `mentorSharedToId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MentorShareInfo` ADD CONSTRAINT `MentorShareInfo_mentorSharingId_fkey` FOREIGN KEY (`mentorSharingId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorShareInfo` ADD CONSTRAINT `MentorShareInfo_mentorSharedToId_fkey` FOREIGN KEY (`mentorSharedToId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
