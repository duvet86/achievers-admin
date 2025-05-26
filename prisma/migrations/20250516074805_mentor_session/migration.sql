-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_chapterId_fkey`;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_mentorId_fkey`;

-- DropForeignKey
ALTER TABLE `StudentSession` DROP FOREIGN KEY `StudentSession_sessionId_fkey`;

-- DropForeignKey
ALTER TABLE `StudentSession` DROP FOREIGN KEY `StudentSession_studentId_fkey`;

-- DropIndex
DROP INDEX `StudentSession_sessionId_studentId_key` ON `StudentSession`;

RENAME TABLE `StudentSession` TO `StudentSession_OLD`;

-- CreateTable
CREATE TABLE `StudentSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chapterId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `attendedOn` DATE NOT NULL,
    `status` ENUM('AVAILABLE', 'UNAVAILABLE') NOT NULL DEFAULT 'AVAILABLE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `StudentSession_chapterId_studentId_attendedOn_key` ON `StudentSession`(`chapterId`, `studentId`, `attendedOn`);

-- CreateTable
CREATE TABLE `SessionAttendance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mentorSessionId` INTEGER NOT NULL,
    `studentSessionId` INTEGER NOT NULL,
    `chapterId` INTEGER NOT NULL,
    `attendedOn` DATE NOT NULL,
    `report` TEXT NULL,
    `hasReport` BOOLEAN AS (report IS NOT NULL),
    `completedOn` DATETIME(3) NULL,
    `notificationSentOn` DATETIME(3) NULL,
    `reportFeedback` TEXT NULL,
    `signedOffOn` DATETIME(3) NULL,
    `signedOffByAzureId` VARCHAR(191) NULL,
    `writteOnBehalfByAzureId` VARCHAR(191) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `cancelledReason` VARCHAR(191) NULL,
    `isCancelled` BOOLEAN AS (cancelledAt IS NOT NULL),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `SessionAttendance_chapterId_mentorSessionId_studentSessionId_key` ON `SessionAttendance`(`chapterId`, `mentorSessionId`, `studentSessionId`);

-- CreateTable
CREATE TABLE `MentorSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chapterId` INTEGER NOT NULL,
    `mentorId` INTEGER NOT NULL,
    `attendedOn` DATE NOT NULL,
    `status` ENUM('AVAILABLE', 'UNAVAILABLE') NOT NULL DEFAULT 'AVAILABLE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `MentorSession_chapterId_mentorId_attendedOn_key` ON `MentorSession`(`chapterId`, `mentorId`, `attendedOn`);

-- AddForeignKey
ALTER TABLE `SessionAttendance` ADD CONSTRAINT `SessionAttendance_mentorSessionId_fkey` FOREIGN KEY (`mentorSessionId`) REFERENCES `MentorSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessionAttendance` ADD CONSTRAINT `SessionAttendance_studentSessionId_fkey` FOREIGN KEY (`studentSessionId`) REFERENCES `StudentSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessionAttendance` ADD CONSTRAINT `SessionAttendance_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorSession` ADD CONSTRAINT `MentorSession_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorSession` ADD CONSTRAINT `MentorSession_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentSession` ADD CONSTRAINT `StudentSession_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentSession` ADD CONSTRAINT `StudentSession_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

 -- --------------------------------------------------------

INSERT INTO `StudentSession`
	(`chapterId`,
    `studentId`,
    `attendedOn`,
    `status`,
    `updatedAt`)
WITH cte1 AS (
	SELECT 
		ROW_NUMBER() OVER (
			PARTITION BY s.attendedOn,  ss.studentId
			ORDER BY 
				s.attendedOn DESC
		) row_num, 
		ss.id,
        s.chapterId,
		s.attendedOn, 
		ss.studentId,
		ss.isCancelled
	FROM  `StudentSession_OLD` ss
	INNER JOIN `Session` s ON s.id = ss.sessionId
)
SELECT
    chapterId,
	studentId,
	attendedOn,
	IF(isCancelled, 'UNAVAILABLE', 'AVAILABLE'),
	NOW()
FROM cte1
WHERE cte1.row_num = 1;

INSERT INTO `MentorSession` (chapterId, mentorId, attendedOn, status, updatedAt)
SELECT s.chapterId, s.mentorId, s.attendedOn, s.status, s.updatedAt
FROM `Session` s;

INSERT INTO `SessionAttendance`
	(`mentorSessionId`,
    `studentSessionId`,
    `chapterId`,
    `attendedOn`,
    `report`,
    `notificationSentOn`,
    `completedOn`,
    `reportFeedback`,
    `signedOffOn`,
    `signedOffByAzureId`,
    `writteOnBehalfByAzureId`,
    `cancelledAt`,
    `cancelledReason`,
    `updatedAt`)
WITH cte2 AS
(
	SELECT
		ss.`studentId`,
        `mentorId`,
		`chapterId`,
        `attendedOn`,
		`report`,
        ss.`notificationSentOn`,
		`completedOn`,
		`reportFeedback`,
		`signedOffOn`,
		`signedOffByAzureId`,
		`writteOnBehalfByAzureId`,
		`cancelledAt`,
		`cancelledReason`,
		ss.`updatedAt`
    FROM `StudentSession_OLD` ss
	INNER JOIN `Session` s ON s.id = ss.sessionId
)
SELECT
	ms.id AS `mentorSessionId`,
    ss.id AS `studentSessionId`,
    c.`chapterId`,
    c.`attendedOn`,
    `report`,
    `notificationSentOn`,
    `completedOn`,
    `reportFeedback`,
    `signedOffOn`,
    `signedOffByAzureId`,
    `writteOnBehalfByAzureId`,
    `cancelledAt`,
    `cancelledReason`,
    c.`updatedAt`
FROM cte2 c
INNER JOIN `MentorSession` ms ON ms.mentorId = c.mentorId AND ms.`attendedOn` = c.`attendedOn`
INNER JOIN `StudentSession` ss ON ss.studentId = c.studentId AND ss.`attendedOn` = c.`attendedOn`;

-- DropTable
-- DROP TABLE `StudentSession_OLD`;

-- DropTable
-- DROP TABLE `Session`;