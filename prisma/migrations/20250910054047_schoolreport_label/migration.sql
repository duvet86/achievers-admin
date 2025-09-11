-- AlterTable
ALTER TABLE `SchoolTerm` ADD COLUMN `label` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `StudentSchoolReport` ADD COLUMN `label` VARCHAR(191) NOT NULL;

-- Migrate Data
UPDATE `StudentSchoolReport` SET `label` = SUBSTRING_INDEX(SUBSTRING_INDEX(`filePath`, '/', -1), '.', 1);
