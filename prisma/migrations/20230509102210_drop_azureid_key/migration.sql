/*
  Warnings:

  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropIndex
DROP INDEX `Session_oauth2State_key` ON `Session`;

-- AlterTable
ALTER TABLE `Session` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`oauth2State`);
