/*
  Warnings:

  - You are about to drop the `mentortostudentsession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `MentorToStudentSession` DROP FOREIGN KEY `MentorToStudentSession_chapterId_fkey`;

-- DropForeignKey
ALTER TABLE `MentorToStudentSession` DROP FOREIGN KEY `MentorToStudentSession_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `MentorToStudentSession` DROP FOREIGN KEY `MentorToStudentSession_userId_fkey`;

-- -- DropTable
-- DROP TABLE `MentorToStudentSession`;

-- CreateTable
CREATE TABLE `Session` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chapterId` INTEGER NOT NULL,
    `mentorId` INTEGER NOT NULL,
    `attendedOn` DATE NOT NULL,
    `status` ENUM('AVAILABLE', 'UNAVAILABLE', 'BOOKED') NOT NULL DEFAULT 'AVAILABLE',

    UNIQUE INDEX `Session_mentorId_chapterId_attendedOn_key`(`mentorId`, `chapterId`, `attendedOn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `report` TEXT NULL,
    `hasReport` BOOLEAN AS (report IS NOT NULL),
    `completedOn` DATETIME(3) NULL,
    `reportFeedback` TEXT NULL,
    `signedOffOn` DATETIME(3) NULL,
    `signedOffByAzureId` VARCHAR(191) NULL,
    `writteOnBehalfByAzureId` VARCHAR(191) NULL,

    UNIQUE INDEX `StudentSession_sessionId_studentId_key`(`sessionId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentSession` ADD CONSTRAINT `StudentSession_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `Session`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentSession` ADD CONSTRAINT `StudentSession_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

/* ----------------------------------MIGRATE DATA--------------------------------------------------------------- */

-- Insert sessions.
INSERT INTO `Session` (chapterId, mentorId, attendedOn)
SELECT
    m.chapterId, m.userId, m.attendedOn
FROM
(
	SELECT
		MAX(id) AS id
	FROM
		`MentorToStudentSession`
	GROUP BY
		chapterId, userId, attendedOn
) as g
JOIN `MentorToStudentSession` m ON g.id = m.id;

-- Insert students' reports.
INSERT INTO `StudentSession` (sessionId, studentId, report, completedOn, reportFeedback, signedOffOn, signedOffByAzureId, writteOnBehalfByAzureId)
SELECT
    sessionId, studentId, report, completedOn, reportFeedback, signedOffOn, signedOffByAzureId, writteOnBehalfByAzureId
FROM (
	SELECT
        s.id as sessionId,
        ms.studentId,
        ms.report,
        ms.completedOn,
        ms.reportFeedback,
        ms.signedOffOn,
        ms.signedOffByAzureId,
        ms.writteOnBehalfByAzureId
    FROM `MentorToStudentSession` ms
    JOIN `Session` s ON s.attendedOn = ms.attendedOn AND s.mentorId = ms.userId
    WHERE ms.studentId IS NOT NULL
) a;