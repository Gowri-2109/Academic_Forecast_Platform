const express = require('express');
const router = express.Router();

// Get low attendance records (< 60%)
router.get('/low', async (req, res) => {
    try {
        const query = `
            SELECT a.student_id, a.subject_id, a.classes_attended, a.total_classes,
                   s.name as student_name, s.register_number, s.department, sub.subject_name 
            FROM attendance a 
            JOIN students s ON a.student_id = s.id 
            JOIN subjects sub ON a.subject_id = sub.id 
            WHERE (a.classes_attended / a.total_classes) < 0.6
            ORDER BY s.register_number ASC
        `;
        const [rows] = await req.db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get attendance for a student
router.get('/:studentId', async (req, res) => {
    try {
        const query = `
            SELECT a.id, a.student_id, a.subject_id, a.classes_attended, a.total_classes, 
            COALESCE(a.percentage, (a.classes_attended / a.total_classes * 100)) as percentage, 
            s.subject_name 
            FROM attendance a 
            JOIN subjects s ON a.subject_id = s.id 
            WHERE a.student_id = ?
        `;
        const [rows] = await req.db.query(query, [req.params.studentId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add or update attendance (Single)
router.post('/', async (req, res) => {
    try {
        const { student_id, subject_id, classes_attended, total_classes } = req.body;
        const percentage = (classes_attended / total_classes) * 100;
        await req.db.query(
            'INSERT INTO attendance (student_id, subject_id, classes_attended, total_classes, percentage) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE classes_attended = ?, total_classes = ?, percentage = ?',
            [student_id, subject_id, classes_attended, total_classes, percentage, classes_attended, total_classes, percentage]
        );

        // Notify student
        await req.db.query(
            'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
            [student_id, `Your attendance record has been updated.`, 'attendance']
        );

        res.json({ message: 'Attendance recorded successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add or update attendance (Bulk)
router.post('/bulk', async (req, res) => {
    try {
        const { attendance } = req.body; 
        if (!attendance || !attendance.length) return res.status(400).json({ error: 'No attendance data provided' });

        const values = attendance.map(a => {
            const pct = (a.classes_attended / a.total_classes) * 100;
            return [a.student_id, a.subject_id, a.classes_attended, a.total_classes, pct];
        });
        
        await req.db.query(
            'INSERT INTO attendance (student_id, subject_id, classes_attended, total_classes, percentage) VALUES ? ON DUPLICATE KEY UPDATE classes_attended = VALUES(classes_attended), total_classes = VALUES(total_classes), percentage = VALUES(percentage)',
            [values]
        );

        // Notify students
        if (attendance.length > 0) {
            const notifValues = attendance.map(a => [a.student_id, `Your attendance record has been updated.`, 'attendance']);
            await req.db.query('INSERT INTO notifications (user_id, message, type) VALUES ?', [notifValues]);
        }

        res.json({ message: 'Bulk attendance recorded successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete attendance record
router.delete('/:studentId/:subjectId', async (req, res) => {
    try {
        await req.db.query(
            'DELETE FROM attendance WHERE student_id = ? AND subject_id = ?',
            [req.params.studentId, req.params.subjectId]
        );
        res.json({ message: 'Attendance deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
