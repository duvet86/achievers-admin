-- CreateTable
CREATE TABLE `MentorResourceCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order` INTEGER NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MentorResourceCategory_label_key`(`label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MentorResource` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order` INTEGER NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `url` VARCHAR(191) NOT NULL,
    `mentorResourceCategoryId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MentorResource_label_url_key`(`label`, `url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MentorResource` ADD CONSTRAINT `MentorResource_mentorResourceCategoryId_fkey` FOREIGN KEY (`mentorResourceCategoryId`) REFERENCES `MentorResourceCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- SEED

INSERT INTO `MentorResourceCategory` (`order`, `label`, `updatedAt`) VALUES (1, 'Educational Tools', NOW());

INSERT INTO `MentorResource` (`order`, `label`, `url`, `mentorResourceCategoryId`, `updatedAt`)
SELECT 1, 'IXL', 'https://au.ixl.com', MAX(id), NOW() FROM `MentorResourceCategory` LIMIT 1;

INSERT INTO `MentorResource` (`order`, `label`, `url`, `mentorResourceCategoryId`, `updatedAt`)
SELECT 2, 'Readworks', 'https://www.readworks.org', MAX(id), NOW() FROM `MentorResourceCategory` LIMIT 1;

INSERT INTO `MentorResource` (`order`, `label`, `url`, `mentorResourceCategoryId`, `updatedAt`)
SELECT 3, 'OLNA', 'https://senior-secondary.scsa.wa.edu.au/assessment/olna/practice-and-example-tests', MAX(id), NOW() FROM `MentorResourceCategory` LIMIT 1;

INSERT INTO `MentorResource` (`order`, `label`, `url`, `mentorResourceCategoryId`, `updatedAt`)
SELECT 4, 'Khan Academy', 'https://www.khanacademy.org', MAX(id), NOW() FROM `MentorResourceCategory` LIMIT 1;

INSERT INTO `MentorResource` (`order`, `label`, `url`, `mentorResourceCategoryId`, `updatedAt`)
SELECT 5, 'Brilliant', 'https://brilliant.org', MAX(id), NOW() FROM `MentorResourceCategory` LIMIT 1;

INSERT INTO `MentorResource` (`order`, `label`, `url`, `mentorResourceCategoryId`, `updatedAt`)
SELECT 6, 'Future You', 'https://futureyouaustralia.com.au/resources', MAX(id), NOW() FROM `MentorResourceCategory` LIMIT 1;

INSERT INTO `MentorResource` (`order`, `label`, `url`, `mentorResourceCategoryId`, `updatedAt`)
SELECT 7, 'eSafety', 'https://www.esafety.gov.au/young-people', MAX(id), NOW() FROM `MentorResourceCategory` LIMIT 1;

-- ------------------------------

INSERT INTO `MentorResourceCategory` (`order`, `label`, `updatedAt`) VALUES (2, 'Career Tools', NOW());

INSERT INTO `MentorResource` (`order`, `label`, `url`, `mentorResourceCategoryId`, `updatedAt`)
SELECT 1, 'Your Career', 'https://www.yourcareer.gov.au', MAX(id), NOW() FROM `MentorResourceCategory` LIMIT 1;

INSERT INTO `MentorResource` (`order`, `label`, `url`, `mentorResourceCategoryId`, `updatedAt`)
SELECT 2, 'Myfuture', 'https://myfuture.edu.au/home', MAX(id), NOW() FROM `MentorResourceCategory` LIMIT 1;

INSERT INTO `MentorResource` (`order`, `label`, `url`, `mentorResourceCategoryId`, `updatedAt`)
SELECT 3, '16 Personalities', 'https://www.16personalities.com', MAX(id), NOW() FROM `MentorResourceCategory` LIMIT 1;

INSERT INTO `MentorResource` (`order`, `label`, `url`, `mentorResourceCategoryId`, `updatedAt`)
SELECT 4, 'Seek', 'https://www.seek.com.au', MAX(id), NOW() FROM `MentorResourceCategory` LIMIT 1;

INSERT INTO `MentorResource` (`order`, `label`, `url`, `mentorResourceCategoryId`, `updatedAt`)
SELECT 5, 'LinkedIn', 'https://www.linkedin.com', MAX(id), NOW() FROM `MentorResourceCategory` LIMIT 1;