/*
  Warnings:

  - You are about to drop the column `hasReport` on the `mentortostudentsession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `MentorToStudentSession`
  DROP COLUMN `hasReport`,
  ADD COLUMN `completedOn` DATETIME(3) NULL;
