/*
  Warnings:

  - Added the required column `hasReport` to the `MentorToStudentSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `mentortostudentsession` ADD COLUMN `hasReport` BOOLEAN AS (report IS NOT NULL);
