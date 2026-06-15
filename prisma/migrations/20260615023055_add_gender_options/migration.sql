/*
  Warnings:

  - Made the column `hasReport` on table `Session` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isCancelled` on table `Session` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Mentor` ADD COLUMN `gender` ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY') NULL;
-- AlterTable
ALTER TABLE `Student` MODIFY `gender` ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY') NULL;