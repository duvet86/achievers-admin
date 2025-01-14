/*
  Warnings:

  - You are about to drop the `mentortostudentsession` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `hasReport` on table `studentsession` required. This step will fail if there are existing NULL values in that column.

*/

-- CreateTable
CREATE TABLE `StudentSchoolReport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filePath` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `studentId` INTEGER NOT NULL,
    `schoolTermId` INTEGER NOT NULL,
    
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StudentSchoolReport` ADD CONSTRAINT `StudentSchoolReport_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentSchoolReport` ADD CONSTRAINT `StudentSchoolReport_schoolTermId_fkey` FOREIGN KEY (`schoolTermId`) REFERENCES `SchoolTerm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
