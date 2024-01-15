-- CreateTable
CREATE TABLE `SchoolTerm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,

    INDEX `SchoolTerm_year_idx`(`year`),
    UNIQUE INDEX `SchoolTerm_startDate_endDate_key`(`startDate`, `endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
