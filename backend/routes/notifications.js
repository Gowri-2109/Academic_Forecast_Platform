const express = require('express');
const router = express.Router();

// GET notifications for a user
router.get('/:userId', async (req, res) => {
    try {
        const [rows] = await req.db.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', 
            [req.params.userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        await req.db.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [req.params.id]);
        res.json({ message: 'Marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT mark all as read for a user
router.put('/read-all/:userId', async (req, res) => {
    try {
        await req.db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.params.userId]);
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
