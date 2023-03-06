/*
  Warnings:

  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `Session` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NULL,
    MODIFY `accessToken` VARCHAR(191) NULL,
    MODIFY `refreshToken` VARCHAR(191) NULL,
    MODIFY `expiresIn` INTEGER NULL,
    ADD PRIMARY KEY (`id`);
