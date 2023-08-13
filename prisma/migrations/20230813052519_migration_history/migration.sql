-- AlterTable
ALTER TABLE `User` MODIFY `addressStreet` VARCHAR(2000) NOT NULL;

-- CreateTable
CREATE TABLE `ImportedHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `error` TEXT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `ImportedHistory_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ImportedHistory` ADD CONSTRAINT `ImportedHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
