-- AddForeignKey
ALTER TABLE `MentoringMentee` ADD CONSTRAINT `MentoringMentee_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
