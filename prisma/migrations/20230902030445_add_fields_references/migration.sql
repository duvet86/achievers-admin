-- AlterTable
ALTER TABLE `reference` ADD COLUMN `buildRelationshipsComment` TEXT NULL,
    ADD COLUMN `empathyAndPatienceComment` TEXT NULL,
    ADD COLUMN `isChildrenSafe` BOOLEAN NULL,
    ADD COLUMN `knownForComment` TEXT NULL,
    ADD COLUMN `skillAndKnowledgeComment` TEXT NULL;
