-- AlterTable
ALTER TABLE `EoIProfile` MODIFY `bestTimeToContact` TEXT NOT NULL,
    MODIFY `volunteerExperience` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Session` MODIFY `accessToken` TEXT NOT NULL,
    MODIFY `refreshToken` TEXT NOT NULL;
