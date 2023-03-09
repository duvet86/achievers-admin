/*
  Warnings:

  - You are about to drop the column `attendance` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `MentoringMentee` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `attendance`,
    ADD COLUMN `defaultAttendance` ENUM('Weekly', 'Fortnightly', 'Other') NULL;
