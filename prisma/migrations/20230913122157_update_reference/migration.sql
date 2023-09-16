/*
  Warnings:

  - You are about to drop the column `isChildrenSafe` on the `reference` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Reference` DROP COLUMN `isChildrenSafe`,
    ADD COLUMN `safeWithChildren` TEXT NULL,
    MODIFY `bestTimeToContact` VARCHAR(191) NULL;
