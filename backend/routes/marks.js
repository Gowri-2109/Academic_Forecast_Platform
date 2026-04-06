const express = require('express');
const router = express.Router();

// Get marks for a student
router.get('/:studentId', async (req, res) => {
    try {
        // join marks with subjects to get the subject name
        const query = `
            SELECT m.*, s.subject_name, s.course_code 
            FROM marks m 
            JOIN subjects s ON m.subject_id = s.id 
            WHERE m.student_id = ?
        `;
        const [rows] = await req.db.query(query, [req.params.studentId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get marks by subject
router.get('/subject/:subjectId', async (req, res) => {
    try {
        const [rows] = await req.db.query(
            'SELECT student_id, internal_mark FROM marks WHERE subject_id = ?',
            [req.params.subjectId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add or update internal marks (Bulk)
router.post('/bulk', async (req, res) => {
    try {
        const { marks } = req.body; // Array of { student_id, subject_id, internal_mark }
        if (!marks || !marks.length) return res.status(400).json({ error: 'No marks provided' });

        const values = marks.map(m => [m.student_id, m.subject_id, m.internal_mark]);
        
        await req.db.query(
            'INSERT INTO marks (student_id, subject_id, internal_mark) VALUES ? ON DUPLICATE KEY UPDATE internal_mark = VALUES(internal_mark)',
            [values]
        );

        // Notify students
        if (marks.length > 0) {
            const notifValues = marks.map(m => [m.student_id, `Internal marks updated for a subject.`, 'mark']);
            await req.db.query('INSERT INTO notifications (user_id, message, type) VALUES ?', [notifValues]);
        }

        res.json({ message: 'Bulk marks recorded successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add or update internal marks
router.post('/', async (req, res) => {
    try {
        const { student_id, subject_id, internal_mark } = req.body;
        // Using upsert (INSERT ... ON DUPLICATE KEY UPDATE)
        const [result] = await req.db.query(
            'INSERT INTO marks (student_id, subject_id, internal_mark) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE internal_mark = ?',
            [student_id, subject_id, internal_mark, internal_mark]
        );

        // Notify student
        await req.db.query(
            'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
            [student_id, `Your internal marks for a subject have been updated.`, 'mark']
        );

        res.json({ message: 'Marks recorded successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a mark
router.delete('/:studentId/:subjectId', async (req, res) => {
    try {
        await req.db.query(
            'DELETE FROM marks WHERE student_id = ? AND subject_id = ?',
            [req.params.studentId, req.params.subjectId]
        );
        res.json({ message: 'Mark deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
