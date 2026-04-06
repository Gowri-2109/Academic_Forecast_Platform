const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = req.db;
        
        // Find user
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        // Check password - in a real app, use bcrypt.compare(password, user.password)
        // For simplicity in the mini-project testing, we are allowing simple text if it matches, 
        // OR doing bcrypt compare if they used hashes. 
        // Let's implement real bcrypt compare but allow a backdoor for demo if needed.
        const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
        
        // Fallback for simple demo testing (optional, remove in production)
        const isPlainMatch = password === user.password;
        
        if (!isMatch && !isPlainMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Create token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, 
            process.env.JWT_SECRET || 'academic_secret_key', 
            { expiresIn: '1d' }
        );
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Seed an admin user if table is empty (Helper route for setup)
router.post('/seed', async (req, res) => {
    try {
        const db = req.db;
        const [users] = await db.query('SELECT * FROM users');
        
        if (users.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await db.query(
                "INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@college.edu', ?, 'Admin')", 
                [hashedPassword]
            );
            res.json({ message: 'Admin seeded (admin@college.edu / admin123)' });
        } else {
            res.json({ message: 'Users already exist' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Change Password Route
router.put('/change-password', async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        const db = req.db;
        
        if (!userId || !newPassword) {
            return res.status(400).json({ error: 'User ID and new password are required' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
        
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during password change' });
    }
});

module.exports = router;
