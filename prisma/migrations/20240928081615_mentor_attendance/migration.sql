-- DropForeignKey
ALTER TABLE `MentorToStudentSession` DROP FOREIGN KEY `MentorToStudentSession_studentId_fkey`;

-- CreateTable
CREATE TABLE `MentorAttendance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chapterId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `attendedOn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MentorAttendance_chapterId_userId_attendedOn_key`(`chapterId`, `userId`, `attendedOn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MentorToStudentSession` ADD CONSTRAINT `MentorToStudentSession_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorAttendance` ADD CONSTRAINT `MentorAttendance_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorAttendance` ADD CONSTRAINT `MentorAttendance_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
