const express = require('express');
const router = express.Router();

// GET all students
router.get('/', async (req, res) => {
    try {
        const [rows] = await req.db.query(`
            SELECT s.*, u.email, p.risk_level, p.performance_level, f.name as faculty_name
            FROM students s 
            LEFT JOIN users u ON s.id = u.id 
            LEFT JOIN predictions p ON s.id = p.student_id
            LEFT JOIN users f ON s.faculty_id = f.id
            ORDER BY s.register_number ASC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET specific student by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await req.db.query(`
            SELECT s.*, u.email 
            FROM students s 
            LEFT JOIN users u ON s.id = u.id 
            WHERE s.id = ?
        `, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const bcrypt = require('bcrypt');

// POST new student
router.post('/', async (req, res) => {
    try {
        const { name, register_number, department, year, semester: bodySemester, email, password, dob, age, address } = req.body;
        
        let newUserId = null;
        // If password is provided, create a user login
        if (email && password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const [userResult] = await req.db.query(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, 'student']
            );
            newUserId = userResult.insertId;
        }
        
        const semester = year || bodySemester || 1;
        const generatedGPA = (Math.random() * (9.0 - 6.0) + 6.0).toFixed(2);
        let insertStatus;
        if (newUserId) {
            const [result] = await req.db.query(
                'INSERT INTO students (id, name, register_number, department, semester, previousGPA, faculty_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [newUserId, name, register_number, department, semester, generatedGPA, req.body.faculty_id || null]
            );
            insertStatus = result;
        } else {
            const [result] = await req.db.query(
                'INSERT INTO students (name, register_number, department, semester, previousGPA, faculty_id) VALUES (?, ?, ?, ?, ?, ?)',
                [name, register_number, department, semester, generatedGPA, req.body.faculty_id || null]
            );
            insertStatus = result;
        }
        res.status(201).json({ message: 'Student created', id: insertStatus.insertId || newUserId, previousGPA: generatedGPA });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
           return res.status(400).json({ error: 'Email or Register Number already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// PUT update student
router.put('/:id', async (req, res) => {
    try {
        const { name, register_number, department, semester, previousGPA, faculty_id } = req.body;
        await req.db.query(
            'UPDATE students SET name = ?, register_number = ?, department = ?, semester = ?, previousGPA = ?, faculty_id = ? WHERE id = ?',
            [name, register_number, department, semester, previousGPA, faculty_id || null, req.params.id]
        );
        res.json({ message: 'Student updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE student
router.delete('/:id', async (req, res) => {
    try {
        await req.db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
        await req.db.query('DELETE FROM users WHERE id = ?', [req.params.id]).catch(() => {});
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST bulk upload students
router.post('/bulk', async (req, res) => {
    try {
        const students = req.body;
        if (!Array.isArray(students)) return res.status(400).json({ error: 'Expected an array of students' });
        
        let successCount = 0;
        let errors = [];

        for (let i = 0; i < students.length; i++) {
            const row = students[i];
            const name = row.name || row.Name;
            const regNo = row.register_number || row.RegisterNumber || row.reg_no;
            const dept = row.department || row.Department;
            const year = row.year || row.Year;
            const sem = row.semester || row.Semester || year || 1;
            const email = row.email || row.Email;

            if (!name || !regNo) {
                 errors.push(`Row ${i+1}: Missing name or register number`);
                 continue;
            }
            try {
                let newUserId = null;
                const generatedGPA = (Math.random() * (9.0 - 6.0) + 6.0).toFixed(2);
                
                if (email) {
                    const hashedPassword = await bcrypt.hash("student123", 10);
                    const [userRes] = await req.db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, 'student']);
                    newUserId = userRes.insertId;
                }
                
                if (newUserId) {
                    await req.db.query('INSERT INTO students (id, name, register_number, department, semester, previousGPA) VALUES (?, ?, ?, ?, ?, ?)', [newUserId, name, regNo, dept, sem, generatedGPA]);
                } else {
                    await req.db.query('INSERT INTO students (name, register_number, department, semester, previousGPA) VALUES (?, ?, ?, ?, ?)', [name, regNo, dept, sem, generatedGPA]);
                }
                successCount++;
            } catch (err) {
                 errors.push(`Row ${i+1} (${regNo}): ${err.code === 'ER_DUP_ENTRY' ? 'Duplicate entry' : err.message}`);
            }
        }
        res.status(201).json({ message: `Successfully uploaded ${successCount} students.`, errors: errors.length > 0 ? errors : null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET student performance trend
router.get('/:id/performance-trend', async (req, res) => {
    try {
        const [rows] = await req.db.query('SELECT semester, gpa FROM past_performance WHERE student_id = ? ORDER BY semester ASC', [req.params.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
