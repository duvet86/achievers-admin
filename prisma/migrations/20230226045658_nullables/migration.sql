-- AlterTable
ALTER TABLE `User` MODIFY `additionalEmail` VARCHAR(191) NULL,
    MODIFY `isCommiteeMemeber` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `isCurrentMemeber` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `inductionDate` DATETIME(3) NULL,
    MODIFY `isActiveMentor` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `policeCheckRenewalDate` DATETIME(3) NULL,
    MODIFY `WWCCheckRenewalDate` DATETIME(3) NULL,
    MODIFY `WWCCheckNumber` VARCHAR(191) NULL,
    MODIFY `isBoardMemeber` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `endDate` DATETIME(3) NULL;
