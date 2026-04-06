const express = require('express');
const router = express.Router();

// GET all queries (for Admin)
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT q.*, u.name as user_name, u.role
            FROM queries q
            JOIN users u ON q.user_id = u.id
            WHERE q.target_role = 'Admin' 
            ORDER BY q.created_at DESC
        `;
        const [rows] = await req.db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET queries for a specific faculty
router.get('/faculty/:facultyId', async (req, res) => {
    try {
        const query = `
            SELECT q.*, u.name as user_name, u.role
            FROM queries q
            JOIN users u ON q.user_id = u.id
            WHERE q.target_role = 'Faculty' AND q.assigned_to = ?
            ORDER BY q.created_at DESC
        `;
        const [rows] = await req.db.query(query, [req.params.facultyId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET queries for a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const [rows] = await req.db.query(
            'SELECT * FROM queries WHERE user_id = ? ORDER BY created_at DESC', 
            [req.params.userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST submit a new query (from student/faculty)
router.post('/', async (req, res) => {
    try {
        const { user_id, message, target_role } = req.body;
        const role = target_role || 'Admin';
        
        let assignedTo = null;
        if (role === 'Faculty') {
            // Find the faculty mapped to this student via the students table
            const [mapping] = await req.db.query('SELECT faculty_id FROM students WHERE user_id = ? LIMIT 1', [user_id]);
            if (mapping.length > 0 && mapping[0].faculty_id) {
                assignedTo = mapping[0].faculty_id;
            } else {
                return res.status(400).json({ error: 'You are not assigned to any faculty member.' });
            }
        }

        const [result] = await req.db.query(
            'INSERT INTO queries (user_id, message, target_role, assigned_to) VALUES (?, ?, ?, ?)',
            [user_id, message, role, assignedTo]
        );

        // Notify the recipient
        if (role === 'Faculty' && assignedTo) {
            await req.db.query(
                'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
                [assignedTo, `New student query received: "${message.substring(0, 30)}..."`, 'query']
            );
        } else if (role === 'Admin') {
            // Find all admins and notify them? For now just notify user with ID 1 (Admin)
            await req.db.query(
                'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
                [1, `New student query received: "${message.substring(0, 30)}..."`, 'query']
            );
        }

        res.status(201).json({ message: 'Query submitted successfully', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT review and reply to query (Admin or Faculty resolving)
router.put('/:id', async (req, res) => {
    try {
        const queryId = req.params.id;
        const { status, admin_reply } = req.body;
        
        await req.db.query(
            'UPDATE queries SET status = ?, admin_reply = ? WHERE id = ?',
            [status, admin_reply, queryId]
        );

        // If giving a reply or marking complete, automate a notification to that user
        const [queryData] = await req.db.query('SELECT user_id, target_role FROM queries WHERE id = ?', [queryId]);
        
        if (queryData.length > 0) {
            const userId = queryData[0].user_id;
            const isFaculty = queryData[0].target_role === 'Faculty';
            const replier = isFaculty ? 'Your Faculty' : 'An Admin';
            
            const notifMessage = status === 'Completed' 
                 ? `Your query #${queryId} has been resolved by ${replier}.` 
                 : `${replier} replied to your query #${queryId}.`;
                 
            await req.db.query(
                'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
                [userId, notifMessage, 'query']
            );
        }

        res.json({ message: 'Query updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
