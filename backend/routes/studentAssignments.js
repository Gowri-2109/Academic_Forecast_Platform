const express = require('express');
const router = express.Router();

// GET all assignments mapping
router.get('/', async (req, res) => {
    try {
        const [rows] = await req.db.query(`
            SELECT s.id as id, s.faculty_id, s.id as student_id, 
                   u.name as faculty_name, s.name as student_name, s.register_number
            FROM students s
            JOIN users u ON s.faculty_id = u.id
            WHERE s.faculty_id IS NOT NULL
            ORDER BY s.register_number ASC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET assignments for a specific faculty
router.get('/faculty/:facultyId', async (req, res) => {
    try {
        const [rows] = await req.db.query(`
            SELECT s.id, s.id as student_id, s.name as student_name, s.register_number, s.department, s.semester
            FROM students s
            WHERE s.faculty_id = ?
            ORDER BY s.register_number ASC
        `, [req.params.facultyId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST assign multiple students to a faculty
router.post('/assign', async (req, res) => {
    try {
        const { faculty_id, student_ids } = req.body;
        console.log(`Assigning ${student_ids?.length} students to faculty ${faculty_id}`);
        
        if (!Array.isArray(student_ids) || student_ids.length === 0) {
            return res.status(400).json({ error: 'Must provide an array of student_ids' });
        }

        // Update students table directly
        const [result] = await req.db.query(
            'UPDATE students SET faculty_id = ? WHERE id IN (?)',
            [faculty_id, student_ids]
        );
        
        console.log(`Assignment result: ${result.affectedRows} rows updated`);
        res.json({ message: `Successfully assigned ${student_ids.length} students` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:assignmentId', async (req, res) => {
    try {
        await req.db.query('UPDATE students SET faculty_id = NULL WHERE id = ?', [req.params.assignmentId]);
        res.json({ message: 'Assignment removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
