-- AlterTable
ALTER TABLE `Mentor`
  ADD COLUMN `note` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Mentor`
  MODIFY COLUMN `fullName` VARCHAR(191) GENERATED ALWAYS AS (CONCAT(`firstName`, IF(`preferredName` IS NULL, ' ', CONCAT(' (', `preferredName`, ') ')), `lastName`, IF(`note` IS NULL, '', CONCAT(' (', `note`, ')')))) STORED NOT NULL;