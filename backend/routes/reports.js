const express = require('express');
const router = express.Router();

router.get('/performance', async (req, res) => {
    try {
        // Here we aggregate data for the frontend Chart.js components
        
        // 1. Performance distribution from the newest predictions for all students
        const predictionsQuery = `
            SELECT p.performance_level, COUNT(*) as count 
            FROM predictions p
            INNER JOIN (
                SELECT student_id, MAX(generated_date) as max_date
                FROM predictions
                GROUP BY student_id
            ) latest ON p.student_id = latest.student_id AND p.generated_date = latest.max_date
            GROUP BY p.performance_level
        `;
        const [perfomanceDist] = await req.db.query(predictionsQuery);

        // 2. Risk distribution
        const riskQuery = `
            SELECT p.risk_level, COUNT(*) as count 
            FROM predictions p
            INNER JOIN (
                SELECT student_id, MAX(generated_date) as max_date
                FROM predictions
                GROUP BY student_id
            ) latest ON p.student_id = latest.student_id AND p.generated_date = latest.max_date
            GROUP BY p.risk_level
        `;
        const [riskDist] = await req.db.query(riskQuery);
        
        // 3. Subject-based pass percentage (students > 50 marks)
        const subjectQuery = `
            SELECT s.subject_name, s.course_code,
                   COUNT(m.id) as total_students,
                   SUM(CASE WHEN m.internal_mark >= 50 THEN 1 ELSE 0 END) as passed_students
            FROM subjects s
            LEFT JOIN marks m ON s.id = m.subject_id
            GROUP BY s.id, s.subject_name, s.course_code
        `;
        const [subjectDist] = await req.db.query(subjectQuery);
        
        // Map percentages explicitly for the UI
        const mappedSubjects = subjectDist.map(s => ({
            ...s,
            pass_percentage: s.total_students > 0 ? ((s.passed_students / s.total_students) * 100).toFixed(1) : 0
        }));

        // 4. Faculty Performance Mock (based on student averages)
        const [facStats] = await req.db.query(`
            SELECT f.id, f.name, COUNT(s.id) as student_count, AVG(p.predicted_gpa) as avg_gpa
            FROM users f
            LEFT JOIN students s ON f.id = s.faculty_id
            LEFT JOIN (
                SELECT student_id, MAX(generated_date) as max_date
                FROM predictions
                GROUP BY student_id
            ) latest ON s.id = latest.student_id
            LEFT JOIN predictions p ON s.id = p.student_id AND p.generated_date = latest.max_date
            WHERE f.role = 'faculty' OR f.role = 'Faculty'
            GROUP BY f.id, f.name
        `);
        
        const facultyRisks = facStats.map(f => ({
            risk_level: f.name,
            count: f.student_count || 0,
            avg_gpa: f.avg_gpa || 0
        }));

        // 5. Critical Alerts Data (Attendance < 75%)
        const [lowAtt] = await req.db.query(`
            SELECT COUNT(*) as c FROM (
                SELECT student_id, (SUM(classes_attended)/SUM(total_classes)*100) as avg_att 
                FROM attendance 
                GROUP BY student_id 
                HAVING avg_att < 75
            ) as low_att_students
        `);
        const lowAttendanceCount = lowAtt[0].c;

        const [topRiskStus] = await req.db.query(`
            SELECT s.id, s.name, s.register_number, p.risk_level, p.performance_level
            FROM predictions p
            JOIN students s ON p.student_id = s.id
            INNER JOIN (
                SELECT student_id, MAX(generated_date) as max_date
                FROM predictions
                GROUP BY student_id
            ) latest ON p.student_id = latest.student_id AND p.generated_date = latest.max_date
            WHERE p.risk_level = 'High'
            LIMIT 10
        `);

        const summaryData = {
           performance: perfomanceDist,
           risks: riskDist,
           subjects: mappedSubjects,
           facultyRisks: facultyRisks,
           lowAttendanceCount,
           topRiskStudents: topRiskStus
        };

        res.json(summaryData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate reports' });
    }
});

module.exports = router;
