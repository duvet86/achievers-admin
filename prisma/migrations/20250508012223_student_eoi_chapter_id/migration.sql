-- AlterTable
ALTER TABLE `EoiStudentProfile`
  DROP COLUMN `preferredChapter`,
  MODIFY `preferredName` VARCHAR(191) NULL,
  ADD COLUMN `chapterId` INTEGER NOT NULL,
  ADD COLUMN `schoolName` VARCHAR(191) NOT NULL,
  ADD COLUMN `fullName` VARCHAR(191) GENERATED ALWAYS AS (CONCAT(`firstName`, ' ', `lastName`) ) STORED NOT NULL;

-- AddForeignKey
ALTER TABLE `EoiStudentProfile`
  ADD CONSTRAINT `EoiStudentProfile_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
