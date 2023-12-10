-- AlterTable
ALTER TABLE `Student`
    MODIFY `startDate` DATETIME(3) NULL,
    MODIFY `dateOfBirth` DATETIME(3) NULL,
    MODIFY `address` VARCHAR(191) NULL,
    MODIFY `bestPersonToContact` VARCHAR(191) NULL,
    MODIFY `bestContactMethod` VARCHAR(191) NULL,
    MODIFY `schoolName` VARCHAR(191) NULL,
    MODIFY `yearLevel` VARCHAR(191) NULL,
    MODIFY `emergencyContactFullName` VARCHAR(191) NULL,
    MODIFY `emergencyContactRelationship` VARCHAR(191) NULL,
    MODIFY `emergencyContactPhone` VARCHAR(191) NULL,
    MODIFY `emergencyContactEmail` VARCHAR(191) NULL,
    MODIFY `emergencyContactAddress` VARCHAR(191) NULL;
