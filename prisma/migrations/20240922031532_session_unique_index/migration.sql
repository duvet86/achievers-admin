/*
  Warnings:

  - A unique constraint covering the columns `[userId,studentId,chapterId,attendedOn]` on the table `MentorToStudentSession` will be added. If there are existing duplicate values, this will fail.

*/
ALTER TABLE `MentorToStudentSession`
	DROP FOREIGN KEY `MentorToStudentSession_chapterId_fkey`,
	DROP FOREIGN KEY `MentorToStudentSession_studentId_fkey`,
	DROP FOREIGN KEY `MentorToStudentSession_userId_fkey`;

-- DropIndex
DROP INDEX `MentorToStudentSession_studentId_chapterId_attendedOn_key` ON `mentortostudentsession`;

-- CreateIndex
CREATE UNIQUE INDEX `MentorToStudentSession_userId_studentId_chapterId_attendedOn_key` ON `MentorToStudentSession`(`userId`, `studentId`, `chapterId`, `attendedOn`);

ALTER TABLE `MentorToStudentSession`
    ADD CONSTRAINT `MentorToStudentSession_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
	  ADD CONSTRAINT `MentorToStudentSession_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
	  ADD CONSTRAINT `MentorToStudentSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;