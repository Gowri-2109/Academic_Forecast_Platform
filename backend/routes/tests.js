const express = require('express');
const router = express.Router();

// GET all tests created by a user (Admin/Faculty)
router.get('/creator/:userId', async (req, res) => {
    try {
        const [rows] = await req.db.query(
            'SELECT * FROM tests WHERE created_by = ? ORDER BY test_date DESC',
            [req.params.userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET tests for a specific student (by student's USER ID)
router.get('/student/:studentUserId', async (req, res) => {
    try {
        // Resolve user_id to internal student_id
        const [studentRes] = await req.db.query('SELECT id FROM students WHERE user_id = ?', [req.params.studentUserId]);
        if (studentRes.length === 0) return res.json([]);
        const studentId = studentRes[0].id;

        const [rows] = await req.db.query(`
            SELECT t.*, tm.marks_obtained, tm.status as assignment_status
            FROM tests t
            JOIN test_marks tm ON t.id = tm.test_id
            WHERE tm.student_id = ?
            ORDER BY t.test_date DESC
        `, [studentId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create a test
router.post('/', async (req, res) => {
    try {
        const { title, description, total_marks, test_date, duration_mins, created_by, role, student_ids } = req.body;
        
        const [testResult] = await req.db.query(
            'INSERT INTO tests (title, description, total_marks, test_date, duration_mins, created_by) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, total_marks, test_date, duration_mins, created_by]
        );
        const testId = testResult.insertId;

        let targetStudents = [];
        const normalizedRole = String(role).toLowerCase();

        if (student_ids && student_ids.length > 0) {
            targetStudents = student_ids;
        } else if (normalizedRole === 'admin') {
            // Get all students
            const [students] = await req.db.query('SELECT id FROM students');
            targetStudents = students.map(s => s.id);
        } else if (normalizedRole === 'faculty') {
            // Get students assigned to this faculty
            const [students] = await req.db.query('SELECT id FROM students WHERE faculty_id = ?', [created_by]);
            targetStudents = students.map(s => s.id);
        }

        if (targetStudents.length > 0) {
            const values = targetStudents.map(sId => [testId, sId]);
            await req.db.query(
                'INSERT INTO test_marks (test_id, student_id) VALUES ?',
                [values]
            );

            // Populate assigned_students field in the test record
            await req.db.query('UPDATE tests SET assigned_students = ? WHERE id = ?', [JSON.stringify(targetStudents), testId]);

            // Notify students
            const notifValues = targetStudents.map(sId => [sId, `New Test Announced: ${title}`, 'test']);
            await req.db.query(
                'INSERT INTO notifications (user_id, message, type) VALUES ?',
                [notifValues]
            );
        }

        res.status(201).json({ message: 'Test created and assigned successfully', testId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET students assigned to a test
router.get('/:testId/students', async (req, res) => {
    try {
        const [rows] = await req.db.query(`
            SELECT tm.*, s.name as student_name, s.register_number
            FROM test_marks tm
            JOIN students s ON tm.student_id = s.id
            WHERE tm.test_id = ?
        `, [req.params.testId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST update marks
router.post('/:testId/marks', async (req, res) => {
    try {
        const { marks, markCompleted } = req.body; // marks: Array of { student_id, marks_obtained }
        const testId = req.params.testId;

        for (const m of marks) {
            await req.db.query(
                'UPDATE test_marks SET marks_obtained = ?, status = "Graded" WHERE test_id = ? AND student_id = ?',
                [m.marks_obtained, testId, m.student_id]
            );
        }

        if (markCompleted) {
            await req.db.query('UPDATE tests SET status = "Completed" WHERE id = ?', [testId]);
            
            // Notify students that marks are released
            const [testData] = await req.db.query('SELECT title FROM tests WHERE id = ?', [testId]);
            const [assigned] = await req.db.query('SELECT student_id FROM test_marks WHERE test_id = ?', [testId]);
            if (assigned.length > 0) {
                const notifValues = assigned.map(a => [a.student_id, `Marks released for Test: ${testData[0].title}`, 'mark']);
                await req.db.query('INSERT INTO notifications (user_id, message, type) VALUES ?', [notifValues]);
            }
        }

        res.json({ message: 'Marks updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
