/*
  Warnings:

  - The primary key for the `mentortostudentassignement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `mentortostudentsession` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,studentId]` on the table `MentorToStudentAssignement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,studentId,chapterId,attendedOn]` on the table `MentorToStudentSession` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `MentorToStudentAssignement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `MentorToStudentSession` table without a default value. This is not possible if the table is not empty.

*/

-- AlterTable
ALTER TABLE `MentorToStudentAssignement`
    DROP FOREIGN KEY `MentorToStudentAssignement_studentId_fkey`,
    DROP FOREIGN KEY `MentorToStudentAssignement_userId_fkey`,
    DROP PRIMARY KEY;

ALTER TABLE `MentorToStudentAssignement`
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT FIRST,
    ADD PRIMARY KEY (`id`),
    ADD CONSTRAINT `MentorToStudentAssignement_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `MentorToStudentAssignement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `MentorToStudentSession`
	  DROP FOREIGN KEY `MentorToStudentSession_chapterId_fkey`,
	  DROP FOREIGN KEY `MentorToStudentSession_studentId_fkey`,
	  DROP FOREIGN KEY `MentorToStudentSession_userId_fkey`,
    DROP PRIMARY KEY;

ALTER TABLE `MentorToStudentSession`
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT FIRST,
    ADD COLUMN `isCancelled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `reasonCancelled` TEXT NULL,
    ADD PRIMARY KEY (`id`),
    ADD CONSTRAINT `MentorToStudentSession_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `chapter` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
	  ADD CONSTRAINT `MentorToStudentSession_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
	  ADD CONSTRAINT `MentorToStudentSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX `MentorToStudentAssignement_userId_studentId_key` ON `MentorToStudentAssignement`(`userId`, `studentId`);

-- CreateIndex
CREATE UNIQUE INDEX `MentorToStudentSession_userId_studentId_chapterId_attendedOn_key` ON `MentorToStudentSession`(`userId`, `studentId`, `chapterId`, `attendedOn`);
