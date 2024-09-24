-- DropForeignKey
ALTER TABLE `MentorToStudentSession` DROP FOREIGN KEY `MentorToStudentSession_studentId_fkey`;

-- AlterTable
ALTER TABLE `MentorToStudentSession` MODIFY `studentId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `MentorToStudentSession` ADD CONSTRAINT `MentorToStudentSession_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
