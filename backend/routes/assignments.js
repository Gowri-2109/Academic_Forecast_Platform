const express = require('express');
const router = express.Router();

// Get assignments for a student
router.get('/student/:studentId', async (req, res) => {
    try {
        const query = `
            SELECT a.*, s.subject_name 
            FROM assignments a 
            JOIN subjects s ON a.subject_id = s.id 
            WHERE a.student_id = ?
        `;
        const [rows] = await req.db.query(query, [req.params.studentId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get submitted assignments for a specific subject
router.get('/submitted/:subjectId', async (req, res) => {
    try {
        const query = `
            SELECT a.*, s.name as student_name, s.register_number
            FROM assignments a 
            JOIN students s ON a.student_id = s.id 
            WHERE a.subject_id = ? AND a.status = 'Submitted'
        `;
        const [rows] = await req.db.query(query, [req.params.subjectId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add or update an assignment status (Single)
router.post('/', async (req, res) => {
    try {
        const { student_id, subject_id, status, score } = req.body;
        const [result] = await req.db.query(
            'INSERT INTO assignments (student_id, subject_id, status, score) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?, score = ?',
            [student_id, subject_id, status, score, status, score]
        );
        res.json({ message: 'Assignment recorded successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add or update assignment scores (Bulk)
router.post('/bulk', async (req, res) => {
    try {
        const { assignments } = req.body; // Array of { student_id, subject_id, status, score }
        if (!assignments || !assignments.length) return res.status(400).json({ error: 'No data provided' });

        const values = assignments.map(a => [a.student_id, a.subject_id, a.status, a.score]);
        
        await req.db.query(
            'INSERT INTO assignments (student_id, subject_id, status, score) VALUES ? ON DUPLICATE KEY UPDATE status = VALUES(status), score = VALUES(score)',
            [values]
        );
        res.json({ message: 'Bulk assignments recorded successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
