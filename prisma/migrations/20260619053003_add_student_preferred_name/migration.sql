-- AlterTable
ALTER TABLE `Student` ADD COLUMN `preferredName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Student`
  MODIFY COLUMN `fullName` VARCHAR(191) GENERATED ALWAYS AS (CONCAT(`firstName`, IF(`preferredName` IS NULL, ' ', CONCAT(' (', `preferredName`, ') ')), `lastName`)) STORED NOT NULL;