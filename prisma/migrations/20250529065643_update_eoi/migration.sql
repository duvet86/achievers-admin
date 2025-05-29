-- AlterTable
ALTER TABLE `EoIProfile`
  ADD COLUMN `linkedInProfile` VARCHAR(191) NULL,
  ADD COLUMN `wasMentor` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User`
  ADD COLUMN `preferredName` VARCHAR(191) NULL,
  MODIFY COLUMN `fullName` VARCHAR(191) GENERATED ALWAYS AS (CONCAT(`firstName`, IF(`preferredName` IS NULL, ' ', CONCAT(' (', `preferredName`, ') ')), `lastName`) ) STORED NOT NULL;