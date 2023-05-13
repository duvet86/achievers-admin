/*
  Warnings:

  - You are about to drop the `VolunteerAgreement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `VolunteerAgreement` DROP FOREIGN KEY `VolunteerAgreement_userId_fkey`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `volunteerAgreementSignedOn` DATETIME(3) NULL;

-- DropTable
DROP TABLE `VolunteerAgreement`;
