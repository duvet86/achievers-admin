-- AlterTable
ALTER TABLE `eoiprofile` MODIFY `bestTimeToContact` TEXT NOT NULL,
    MODIFY `volunteerExperience` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `session` MODIFY `accessToken` TEXT NOT NULL,
    MODIFY `refreshToken` TEXT NOT NULL;
