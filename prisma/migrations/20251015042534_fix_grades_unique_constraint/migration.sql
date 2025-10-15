-- DropIndex
DROP INDEX `StudentGrade_year_semester_subject_key` ON `studentgrade`;

-- CreateIndex
CREATE UNIQUE INDEX `StudentGrade_year_semester_subject_studentId_key` ON `StudentGrade`(`year`, `semester`, `subject`, `studentId`);
