/*
  Warnings:

  - Added the required column `address` to the `UserEOIForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `UserEOIForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `UserEOIForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `UserEOIForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobile` to the `UserEOIForm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `UserEOIForm` ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL,
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL,
    ADD COLUMN `mobile` VARCHAR(191) NOT NULL;
