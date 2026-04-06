const express = require('express');
const router = express.Router();

// Get disciplinary records for a student
router.get('/:studentId', async (req, res) => {
    try {
        const [rows] = await req.db.query('SELECT * FROM disciplinary_records WHERE student_id = ?', [req.params.studentId]);
        const mappedRows = rows.map(r => ({
            ...r,
            incident_date: r.date
        }));
        res.json(mappedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a disciplinary record
router.post('/', async (req, res) => {
    try {
        const { student_id, issue_type, description, date, priority, status } = req.body;
        const [result] = await req.db.query(
            'INSERT INTO disciplinary_records (student_id, issue_type, description, date, priority, status) VALUES (?, ?, ?, ?, ?, ?)',
            [student_id, issue_type, description, date, priority || 'Medium', status || 'Open']
        );
        res.status(201).json({ message: 'Disciplinary record added successfully', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all disciplinary records
router.get('/', async (req, res) => {
    try {
        const [rows] = await req.db.query(`
            SELECT d.*, s.name as student_name, s.register_number, s.department, s.year
            FROM disciplinary_records d
            LEFT JOIN students s ON d.student_id = s.id
            ORDER BY s.register_number ASC, d.date DESC
        `);
        const mappedRows = rows.map(r => ({
            ...r,
            incident_date: r.date
        }));
        res.json(mappedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a disciplinary record
router.delete('/record/:id', async (req, res) => {
    try {
        await req.db.query('DELETE FROM disciplinary_records WHERE id = ?', [req.params.id]);
        res.json({ message: 'Record deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a disciplinary record (priority and status)
router.put('/record/:id', async (req, res) => {
    try {
        const { priority, status } = req.body;
        await req.db.query(
            'UPDATE disciplinary_records SET priority = ?, status = ? WHERE id = ?',
            [priority || 'Medium', status || 'Open', req.params.id]
        );
        res.json({ message: 'Record updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
