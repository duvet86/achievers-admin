-- DropForeignKey
ALTER TABLE `PoliceCheck` DROP FOREIGN KEY `PoliceCheck_volunteerId_fkey`;

-- DropForeignKey
ALTER TABLE `WWCCheck` DROP FOREIGN KEY `WWCCheck_volunteerId_fkey`;

-- DropIndex
DROP INDEX `PoliceCheck_volunteerId_key` ON `PoliceCheck`;

-- DropIndex
DROP INDEX `WWCCheck_volunteerId_key` ON `WWCCheck`;

-- AddForeignKey
ALTER TABLE `PoliceCheck` ADD CONSTRAINT `PoliceCheck_volunteerId_fkey` FOREIGN KEY (`volunteerId`) REFERENCES `Volunteer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WWCCheck` ADD CONSTRAINT `WWCCheck_volunteerId_fkey` FOREIGN KEY (`volunteerId`) REFERENCES `Volunteer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
