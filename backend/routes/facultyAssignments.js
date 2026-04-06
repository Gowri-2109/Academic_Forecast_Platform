const express = require('express');
const router = express.Router();

// GET all assignments created by a faculty
router.get('/faculty/:facultyId', async (req, res) => {
    try {
        const [rows] = await req.db.query(
            'SELECT * FROM faculty_assignments WHERE faculty_id = ? ORDER BY deadline ASC',
            [req.params.facultyId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET completion status for an assignment
router.get('/:assignmentId/status', async (req, res) => {
    try {
        const [rows] = await req.db.query(
            `SELECT fas.*, s.name as student_name, s.register_number 
             FROM faculty_assignment_students fas
             JOIN students s ON fas.student_id = s.id
             WHERE fas.assignment_id = ?
             ORDER BY s.register_number ASC`,
            [req.params.assignmentId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create a new assignment
router.post('/', async (req, res) => {
    try {
        const { faculty_id, title, description, materials, submission_type, max_size_mb, file_format, deadline, max_marks, assign_to_all, student_ids } = req.body;
        
        // Insert assignment
        const [result] = await req.db.query(
            `INSERT INTO faculty_assignments 
            (faculty_id, title, description, materials, submission_type, max_size_mb, file_format, deadline, max_marks) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [faculty_id, title, description, materials, submission_type, max_size_mb || null, file_format || null, deadline || null, max_marks || 100]
        );
        const assignmentId = result.insertId;

        let targetStudents = [];
        if (assign_to_all) {
            // Get all assigned students for this faculty from the students table
            const [students] = await req.db.query('SELECT id as student_id FROM students WHERE faculty_id = ?', [faculty_id]);
            targetStudents = students.map(s => s.student_id);
        } else if (student_ids && Array.isArray(student_ids)) {
            targetStudents = student_ids;
        }

        if (targetStudents.length > 0) {
            const values = targetStudents.map(id => [assignmentId, id, 'Pending', 0]);
            await req.db.query(
                'INSERT INTO faculty_assignment_students (assignment_id, student_id, status, score) VALUES ?',
                [values]
            );

            // Send notification to students
            const notifValues = targetStudents.map(id => [id, `New Assignment: ${title}`, 'assignment']);
            if(notifValues.length > 0) {
               await req.db.query(
                   'INSERT INTO notifications (user_id, message, type) VALUES ?',
                   [notifValues]
               );
            }
        }

        res.status(201).json({ message: 'Assignment created successfully', id: assignmentId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT edit assignment deadline
router.put('/:id/deadline', async (req, res) => {
    try {
        const { deadline } = req.body;
        await req.db.query('UPDATE faculty_assignments SET deadline = ? WHERE id = ?', [deadline, req.params.id]);
        res.json({ message: 'Deadline updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT remove assignment
router.delete('/:id', async (req, res) => {
    try {
        await req.db.query('DELETE FROM faculty_assignments WHERE id = ?', [req.params.id]);
        res.json({ message: 'Assignment removed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT bulk update scores
router.put('/bulk-scores', async (req, res) => {
    try {
        const { scores } = req.body; 
        if (!scores || !scores.length) return res.status(400).json({ error: 'No data provided' });

        for (const item of scores) {
            await req.db.query(
                'UPDATE faculty_assignment_students SET score = ? WHERE assignment_id = ? AND student_id = ?',
                [item.score, item.assignment_id, item.student_id]
            );
        }
        res.json({ message: 'Scores updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- STUDENT SIDE ROUTES ---

// Get assignments for a specific student
router.get('/student/:studentId', async (req, res) => {
    try {
        const [rows] = await req.db.query(`
            SELECT fa.*, fas.status, fas.score, fas.submission_date 
            FROM faculty_assignment_students fas
            JOIN faculty_assignments fa ON fas.assignment_id = fa.id
            WHERE fas.student_id = ?
            ORDER BY fa.deadline ASC
        `, [req.params.studentId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submit an assignment (Student Side)
router.put('/submit/:assignmentId/:studentId', async (req, res) => {
    try {
        const { assignmentId, studentId } = req.params;
        await req.db.query(
            'UPDATE faculty_assignment_students SET status = ?, submission_date = CURRENT_TIMESTAMP WHERE assignment_id = ? AND student_id = ?',
            ['Submitted', assignmentId, studentId]
        );
        res.json({ message: 'Assignment submitted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
