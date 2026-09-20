-- AlterTable
ALTER TABLE `Chapter` ADD COLUMN `isMentorHub` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `order` INTEGER NOT NULL;

UPDATE `Chapter` SET `order` = '2' WHERE (`id` = '1');
UPDATE `Chapter` SET `order` = '3' WHERE (`id` = '2');
UPDATE `Chapter` SET `order` = '4' WHERE (`id` = '3');