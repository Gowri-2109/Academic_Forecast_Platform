USE academic_forecast;

-- 2. Add faculty_id column to students table (without IF NOT EXISTS)
-- We'll try to add it and ignore error if exists, or just use a standard ALTER
ALTER TABLE students ADD COLUMN faculty_id INT NULL;

-- 3. Add Foreign Key constraint
ALTER TABLE students ADD CONSTRAINT fk_student_faculty FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE SET NULL;

-- 4. Migrate data from student_assignments to students table
UPDATE students s
JOIN student_assignments sa ON s.id = sa.student_id
SET s.faculty_id = sa.faculty_id;
