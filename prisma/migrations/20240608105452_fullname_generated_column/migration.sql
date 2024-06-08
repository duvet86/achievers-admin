-- AlterTable
ALTER TABLE `Reference` ADD COLUMN `fullName` VARCHAR(191) GENERATED ALWAYS AS (CONCAT(`firstName`, ' ', `lastName`) ) STORED NOT NULL;

-- AlterTable
ALTER TABLE `Student` ADD COLUMN `fullName` VARCHAR(191) GENERATED ALWAYS AS (CONCAT(`firstName`, ' ', `lastName`) ) STORED NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `fullName` VARCHAR(191) GENERATED ALWAYS AS (CONCAT(`firstName`, ' ', `lastName`) ) STORED NOT NULL;
