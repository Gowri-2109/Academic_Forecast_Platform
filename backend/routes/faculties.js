const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// GET all faculty profiles
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT u.id as user_id, u.name, u.email, u.role, 
                   f.first_name, f.last_name, f.dob, f.address, f.department, f.age
            FROM users u
            LEFT JOIN faculty_profiles f ON u.id = f.user_id
            WHERE u.role = 'Faculty' OR u.role = 'faculty'
        `;
        const [rows] = await req.db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new faculty user + profile
router.post('/', async (req, res) => {
    try {
        const { email, password, first_name, last_name, dob, address, department, age } = req.body;
        
        // Setup user table
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // combine names for the basic users table reference
        const fullName = `${first_name} ${last_name}`;
        
        const [userResult] = await req.db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [fullName, email, hashedPassword, 'faculty']
        );
        
        const userId = userResult.insertId;
        
        // Setup faculty_profiles table
        await req.db.query(
            'INSERT INTO faculty_profiles (user_id, first_name, last_name, dob, address, department, age) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, first_name, last_name, dob, address, department, age]
        );
        
        res.status(201).json({ message: 'Faculty created successfully', id: userId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
           return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// DELETE a faculty
router.delete('/:userId', async (req, res) => {
    try {
        // Cascade delete will remove profile and assignments
        await req.db.query('DELETE FROM users WHERE id = ?', [req.params.userId]);
        res.json({ message: 'Faculty removed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update faculty
router.put('/:userId', async (req, res) => {
    try {
        let { first_name, last_name, email, dob, address, department, age } = req.body;
        const fullName = `${first_name} ${last_name}`;
        
        // Fix for empty string dob/age
        if (!dob || dob.trim() === '') dob = null;
        if (!age || age.toString().trim() === '') age = null;
        
        await req.db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [fullName, email, req.params.userId]);
        await req.db.query(
            'UPDATE faculty_profiles SET first_name = ?, last_name = ?, dob = ?, address = ?, department = ?, age = ? WHERE user_id = ?',
            [first_name, last_name, dob, address, department, age, req.params.userId]
        );
        res.json({ message: 'Faculty updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Faculty Dashboard Stats
router.get('/:facultyId/dashboard-stats', async (req, res) => {
    try {
        const facultyId = req.params.facultyId;

        // Total Assigned Students
        const [studentCountRows] = await req.db.query(
            'SELECT COUNT(*) as count FROM students WHERE faculty_id = ?', 
            [facultyId]
        );
        const totalAssignedStudents = studentCountRows[0].count;

        // Disciplinary Issues Count (among assigned students)
        const [disciplinaryRows] = await req.db.query(
            `SELECT COUNT(*) as count FROM disciplinary_records dr
             JOIN students s ON dr.student_id = s.id
             WHERE s.faculty_id = ?`,
            [facultyId]
        );
        const totalDisciplinaryIssues = disciplinaryRows[0].count;

        // Risk Distribution
        const [riskRows] = await req.db.query(
            `SELECT p.risk_level, COUNT(*) as count FROM predictions p
             JOIN students s ON p.student_id = s.id
             WHERE s.faculty_id = ?
             GROUP BY p.risk_level`,
            [facultyId]
        );

        // Subject Performance - Enhanced with Highest/Lowest
        const [perfRows] = await req.db.query(
            `SELECT subj.subject_name, AVG(m.internal_mark) as average_marks
             FROM marks m
             JOIN subjects subj ON m.subject_id = subj.id
             JOIN students s ON m.student_id = s.id
             WHERE s.faculty_id = ?
             GROUP BY m.subject_id`,
            [facultyId]
        );

        let highestSubject = null;
        let lowestSubject = null;
        if (perfRows.length > 0) {
            highestSubject = perfRows.reduce((prev, current) => (prev.average_marks > current.average_marks) ? prev : current);
            lowestSubject = perfRows.reduce((prev, current) => (prev.average_marks < current.average_marks) ? prev : current);
        }

        // AI Insights Logic
        // Calculate high-risk students and primary reason
        const [highRiskStudents] = await req.db.query(
            `SELECT s.id, p.risk_level, 
                    AVG(m.internal_mark) as avg_marks, 
                    AVG(a.percentage) as avg_attendance
             FROM students s
             JOIN predictions p ON s.id = p.student_id
             LEFT JOIN marks m ON s.id = m.student_id
             LEFT JOIN attendance a ON s.id = a.student_id
             WHERE s.faculty_id = ? AND p.risk_level = 'High'
             GROUP BY s.id`,
            [facultyId]
        );

        let primaryReason = "N/A";
        if (highRiskStudents.length > 0) {
            const lowAttendanceCount = highRiskStudents.filter(s => s.avg_attendance < 75).length;
            const lowMarksCount = highRiskStudents.filter(s => s.avg_marks < 60).length;
            
            if (lowAttendanceCount > lowMarksCount) {
                primaryReason = "Low Attendance";
            } else if (lowMarksCount > 0) {
                primaryReason = "Low Academic Performance";
            } else {
                primaryReason = "Multiple Factors";
            }
        }

        res.json({
            totalAssignedStudents,
            totalDisciplinaryIssues,
            riskDistribution: riskRows,
            subjectPerformance: perfRows,
            highestSubject,
            lowestSubject,
            aiInsights: {
                highRiskCount: highRiskStudents.length,
                primaryReason,
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Assigned Students with full details
router.get('/:facultyId/students', async (req, res) => {
    try {
        const facultyId = req.params.facultyId;
        const [students] = await req.db.query(
            `SELECT s.*, p.performance_level, p.risk_level,
             COALESCE((SELECT AVG(percentage) FROM attendance WHERE student_id = s.id), 0) as avg_attendance
             FROM students s
             LEFT JOIN (
                SELECT student_id, risk_level, performance_level
                FROM predictions
                WHERE (student_id, generated_date) IN (
                    SELECT student_id, MAX(generated_date)
                    FROM predictions
                    GROUP BY student_id
                )
             ) p ON s.id = p.student_id
             WHERE s.faculty_id = ?
             ORDER BY s.register_number ASC`,
            [facultyId]
        );
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Issues for Assigned Students (Aggregated for Tracker)
router.get('/:facultyId/issues', async (req, res) => {
    try {
        const facultyId = req.params.facultyId;
        
        const query = `
            WITH LowestAttendance AS (
                SELECT 
                    a.student_id, 
                    a.percentage as lowest_attendance, 
                    s_sub.subject_name as lowest_attendance_subject,
                    ROW_NUMBER() OVER(PARTITION BY a.student_id ORDER BY a.percentage ASC) as rn
                FROM attendance a
                JOIN subjects s_sub ON a.subject_id = s_sub.id
            )
            SELECT 
                s.id as student_id, s.name, s.register_number,
                p.risk_level,
                (CASE 
                    WHEN p.risk_level = 'High' THEN 85
                    WHEN p.risk_level = 'Medium' THEN 55
                    WHEN p.risk_level = 'Low' THEN 25
                    ELSE 0 
                END) as overall_risk_score,
                (CASE 
                    WHEN p.risk_level = 'High' THEN 'High'
                    WHEN p.risk_level = 'Medium' THEN 'Medium'
                    WHEN p.risk_level = 'Low' THEN 'Low'
                    ELSE 'N/A'
                END) as priority,
                COUNT(DISTINCT d.id) as disciplinary_count,
                la.lowest_attendance,
                la.lowest_attendance_subject,
                AVG(m.internal_mark) as avg_marks,
                (CASE
                    WHEN p.risk_level IN ('High', 'Medium') THEN
                        CASE
                            WHEN MIN(la.lowest_attendance) < 75 AND AVG(m.internal_mark) < 60 THEN 'Low Attendance & Low Marks'
                            WHEN MIN(la.lowest_attendance) < 75 THEN 'Low Attendance'
                            WHEN AVG(m.internal_mark) < 60 THEN 'Low Marks'
                            WHEN COUNT(DISTINCT d.id) > 0 THEN 'Disciplinary Issues'
                            ELSE 'Multiple Factors'
                        END
                    ELSE 'Stable'
                END) as risk_reason
            FROM students s
            LEFT JOIN predictions p ON s.id = p.student_id
            LEFT JOIN disciplinary_records d ON s.id = d.student_id
            LEFT JOIN LowestAttendance la ON s.id = la.student_id AND la.rn = 1
            LEFT JOIN marks m ON s.id = m.student_id
            WHERE s.faculty_id = ?
            GROUP BY s.id, s.name, s.register_number, p.risk_level, la.lowest_attendance, la.lowest_attendance_subject
            ORDER BY s.register_number ASC
        `;
        const [rows] = await req.db.query(query, [facultyId]);
        res.json(rows);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
