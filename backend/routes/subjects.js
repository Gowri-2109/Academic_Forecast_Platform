const express = require('express');
const router = express.Router();

// GET all subjects
router.get('/', async (req, res) => {
    try {
        const [rows] = await req.db.query('SELECT * FROM subjects');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new subject
router.post('/', async (req, res) => {
    try {
        const { subject_name, course_code } = req.body;
        const [result] = await req.db.query(
            'INSERT INTO subjects (subject_name, course_code) VALUES (?, ?)',
            [subject_name, course_code]
        );
        res.status(201).json({ message: 'Subject created', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update subject
router.put('/:id', async (req, res) => {
    try {
        const { subject_name, course_code } = req.body;
        await req.db.query(
            'UPDATE subjects SET subject_name = ?, course_code = ? WHERE id = ?',
            [subject_name, course_code, req.params.id]
        );
        res.json({ message: 'Subject updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
