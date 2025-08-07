UPDATE `Session` SET report =
REPLACE (
'{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"{REPORT_TEXT}","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
'{REPORT_TEXT}',
cancelledExtendedReason)
WHERE cancelledExtendedReason IS NOT NULL AND report IS NULL;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_cancelledReasonId_fkey`;

-- DropIndex
DROP INDEX `Session_cancelledReasonId_key` ON `Session`;

-- AlterTable
ALTER TABLE `Session` DROP COLUMN `cancelledExtendedReason`;
