const express = require('express');
const router = express.Router();

router.get('/insights', async (req, res) => {
    try {
        const [dist] = await req.db.query('SELECT risk_level, COUNT(*) as count FROM predictions GROUP BY risk_level');
        const [avg] = await req.db.query('SELECT SUM(internal_mark)/COUNT(*) as avg_marks FROM marks');
        
        // Convert internal mark to a 10.0 scale approx
        let avgGpa = 0;
        if (avg[0].avg_marks) {
            avgGpa = (parseFloat(avg[0].avg_marks) / 100) * 10.0;
        }
        
        res.json({
            riskDistribution: dist,
            averagePredictedGpa: avgGpa.toFixed(2)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Calculate dynamic prediction for a student
const calculateDynamicPrediction = async (db, studentId, previousGPA) => {
    const [marksList] = await db.query('SELECT internal_mark FROM marks WHERE student_id = ?', [studentId]);
    let avgMarks = marksList.length > 0 ? (marksList.reduce((acc, m) => acc + m.internal_mark, 0) / marksList.length) : 0;
    
    const [testList] = await db.query(`
        SELECT tm.marks_obtained, t.total_marks 
        FROM test_marks tm 
        JOIN tests t ON tm.test_id = t.id 
        WHERE tm.student_id = ? AND tm.status = 'Graded'
    `, [studentId]);
    
    let avgTestPct = 0;
    if (testList.length > 0) {
        const totalPct = testList.reduce((acc, t) => acc + (t.marks_obtained / t.total_marks * 100), 0);
        avgTestPct = totalPct / testList.length;
    }

    // Combine marks (70%) and tests (30%) if tests exist, otherwise use just marks
    let combinedPerformance = avgMarks;
    if (testList.length > 0) {
        combinedPerformance = (avgMarks * 0.7) + (avgTestPct * 0.3);
    }
    
    const [attList] = await db.query('SELECT classes_attended, total_classes FROM attendance WHERE student_id = ?', [studentId]);
    let avgAttendance = 0;
    if (attList.length > 0) {
        const total = attList.reduce((acc, a) => acc + a.total_classes, 0);
        const attended = attList.reduce((acc, a) => acc + a.classes_attended, 0);
        avgAttendance = (attended / total) * 100;
    }
    
    // Current semester GPA estimation (10-point scale)
    const currentGPA = (combinedPerformance / 100) * 10.0; 
    
    // Weight previous GPA (60%) and current performance (40%)
    const prev = previousGPA ? parseFloat(previousGPA) : currentGPA;
    let predictedGPA = (prev * 0.6) + (currentGPA * 0.4);
    
    // Safety bounds
    if (predictedGPA > 10) predictedGPA = 10.0;
    if (predictedGPA < 0) predictedGPA = 0.0;

    let riskLevel = "Low";
    let riskPercentage = 0;
    
    // Calculate risk percentage dynamically based on academic parameters
    const marksRisk = Math.max(0, 60 - avgMarks); 
    const attendanceRisk = Math.max(0, 75 - avgAttendance); 
    riskPercentage = Math.min(100, (marksRisk * 1.5) + (attendanceRisk * 1.2));
    
    if (predictedGPA < 5.5 || avgMarks < 50 || avgAttendance < 65) {
        riskLevel = "High";
        riskPercentage = Math.max(riskPercentage, 70); // Ensure percentage maps to High
    } else if (predictedGPA < 6.5 || avgMarks < 65 || avgAttendance < 75) {
        riskLevel = "Medium";
        riskPercentage = Math.max(riskPercentage, 40); // Ensure percentage maps to Medium
    } else {
        riskLevel = "Low";
    }

    let primaryFactor = "None";
    if (riskLevel === "High" || riskLevel === "Medium") {
        if (avgAttendance < 75 && avgAttendance < avgMarks) {
            primaryFactor = "Low Attendance";
        } else {
            primaryFactor = "Academic Performance";
        }
    }

    return {
        studentId,
        predictedGPA: parseFloat(predictedGPA.toFixed(2)),
        avgMarks: parseFloat(avgMarks.toFixed(2)),
        avgAttendance: parseFloat(avgAttendance.toFixed(2)),
        riskLevel,
        riskScorePercentage: Math.round(riskPercentage),
        primaryFactor: primaryFactor === "None" ? "Consistent Performance" : primaryFactor
    };
};

router.get('/faculty/:facultyId', async (req, res) => {
    try {
        const { facultyId } = req.params;
        const db = req.db;
        
        const [assigned] = await db.query(
            `SELECT id, name, register_number, previousGPA, semester 
             FROM students 
             WHERE faculty_id = ?`, 
            [facultyId]
        );
        
        if (assigned.length === 0) {
            return res.json({
                averagePredictedGpa: "0.00",
                riskDistribution: [{ risk_level: 'Low', count: 0 }, { risk_level: 'Medium', count: 0 }, { risk_level: 'High', count: 0 }],
                highRiskStudents: [],
                totalAssigned: 0,
                aiInsights: null
            });
        }

        let totalGPA = 0;
        let riskCounts = { Low: 0, Medium: 0, High: 0 };
        let highRiskStudents = [];
        let factorCounts = {};
        let totalCurrentGPA = 0;
        let totalPrevGPA = 0;

        // Apply prediction dynamically
        for (const student of assigned) {
            const pred = await calculateDynamicPrediction(db, student.id, student.previousGPA);
            totalGPA += pred.predictedGPA;
            totalCurrentGPA += (pred.avgMarks / 100) * 10;
            totalPrevGPA += student.previousGPA ? parseFloat(student.previousGPA) : (pred.avgMarks / 100) * 10;
            
            riskCounts[pred.riskLevel] = (riskCounts[pred.riskLevel] || 0) + 1;
            if (pred.primaryFactor !== "None") {
                factorCounts[pred.primaryFactor] = (factorCounts[pred.primaryFactor] || 0) + 1;
            }
            
            if (pred.riskLevel === 'High') {
                highRiskStudents.push({
                    name: student.name,
                    register_number: student.register_number,
                    predictedGPA: pred.predictedGPA,
                    reason: pred.primaryFactor
                });
            }
        }

        const avgGpa = (totalGPA / assigned.length).toFixed(2);
        const dist = Object.keys(riskCounts).map(k => ({ risk_level: k, count: riskCounts[k] }));

        // Subject-wise insights
        const [subjectStats] = await db.query(`
            SELECT s.subject_name, AVG(m.internal_mark) as avg_mark
            FROM marks m
            JOIN subjects s ON m.subject_id = s.id
            WHERE m.student_id IN (?)
            GROUP BY m.subject_id, s.subject_name
            ORDER BY avg_mark ASC
        `, [assigned.map(s => s.id)]);

        const difficultSubject = subjectStats.length > 0 ? subjectStats[0] : null;
        const scoringSubject = subjectStats.length > 0 ? subjectStats[subjectStats.length - 1] : null;

        // Performance Trend
        const trend = totalCurrentGPA > totalPrevGPA ? 'Improving' : (totalCurrentGPA < totalPrevGPA * 0.95 ? 'Declining' : 'Stable');

        // Main contributing factor
        const topFactor = Object.keys(factorCounts).length > 0 
            ? Object.keys(factorCounts).reduce((a, b) => factorCounts[a] > factorCounts[b] ? a : b)
            : "Academic Consistency";

        res.json({
            averagePredictedGpa: avgGpa,
            riskDistribution: dist,
            highRiskStudents,
            totalAssigned: assigned.length,
            lastUpdated: new Date().toLocaleTimeString(),
            aiInsights: {
                riskSummary: {
                    highRiskPercentage: ((riskCounts.High / assigned.length) * 100).toFixed(0),
                    mainFactor: topFactor
                },
                subjectInsights: {
                    difficult: difficultSubject ? difficultSubject.subject_name : "N/A",
                    scoring: scoringSubject ? scoringSubject.subject_name : "N/A"
                },
                performanceTrend: trend
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/run-all', async (req, res) => {
    try {
        const db = req.db;
        const [students] = await db.query('SELECT id, previousGPA FROM students');
        let count = 0;
        
        for (let s of students) {
            const studentId = s.id;
            const pred = await calculateDynamicPrediction(db, studentId, s.previousGPA);
            
            let finalRiskLevel = pred.riskLevel;
            // Legacy formatting for existing frontend charts/data
            if (finalRiskLevel === 'High') finalRiskLevel = 'High Risk';
            if (finalRiskLevel === 'Low') finalRiskLevel = 'None';

            let perf = "Good";
            if (pred.predictedGPA >= 8.5) perf = "Excellent";
            else if (pred.predictedGPA >= 6.5) perf = "Good";
            else if (pred.predictedGPA >= 5.0) perf = "Average";
            else perf = "At Risk";
            
            await db.query(
                `INSERT INTO predictions (student_id, performance_level, risk_level, risk_score_percentage, predicted_gpa, generated_date) 
                 VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP) 
                 ON DUPLICATE KEY UPDATE 
                    performance_level = VALUES(performance_level), 
                    risk_level = VALUES(risk_level), 
                    risk_score_percentage = VALUES(risk_score_percentage),
                    predicted_gpa = VALUES(predicted_gpa),
                    generated_date = CURRENT_TIMESTAMP`,
                [studentId, perf, finalRiskLevel, pred.riskScorePercentage, pred.predictedGPA]
            );
            count++;
        }
        res.json({ message: `Predictions successfully executed for ${count} students.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/:studentId', async (req, res) => {
    const studentId = req.params.studentId;
    const db = req.db;

    try {
        // 1 & 2 Collect marks and calculate average
        // (Assuming standard 100 max marks per subject for simplicity)
        const [marksList] = await db.query('SELECT m.internal_mark, m.subject_id, s.subject_name FROM marks m JOIN subjects s ON m.subject_id = s.id WHERE m.student_id = ?', [studentId]);
        let avgMarks = 0;
        if (marksList.length > 0) {
            const sum = marksList.reduce((acc, m) => acc + m.internal_mark, 0);
            avgMarks = sum / marksList.length;
        }

        // 3 Collect attendance data
        const [attendanceList] = await db.query('SELECT percentage, classes_attended, total_classes FROM attendance WHERE student_id = ?', [studentId]);
        let avgAttendance = 0;
        if (attendanceList.length > 0) {
            const sum = attendanceList.reduce((acc, a) => {
                const pct = a.percentage !== null ? parseFloat(a.percentage) : (a.total_classes > 0 ? (a.classes_attended / a.total_classes) * 100 : 0);
                return acc + pct;
            }, 0);
            avgAttendance = sum / attendanceList.length;
        }

        // 4 Check assignment completion
        const [assignmentsList] = await db.query('SELECT submission_status FROM assignments WHERE student_id = ?', [studentId]);
        let missingAssignments = false;
        if (assignmentsList.length === 0) {
             // Treat no data as missing generally, or treat as fine. Let's strictly check if there is an explicit 'Missing'.
             // Or if count is 0, we can assume missing assignments if we expect subjects. 
             // We'll check if any assignment is 'Missing'.
             missingAssignments = true; 
        } else {
             missingAssignments = assignmentsList.some(a => a.submission_status === 'Not Submitted');
        }

        // 5 Check disciplinary records
        const [disciplinaryList] = await db.query('SELECT * FROM disciplinary_records WHERE student_id = ?', [studentId]);
        const malpracticeCount = disciplinaryList.length;
        const hasMalpractice = malpracticeCount > 0;

        const [studentData] = await db.query('SELECT previousGPA FROM students WHERE id = ?', [studentId]);
        const previousGPA = studentData.length > 0 ? studentData[0].previousGPA : null;

        // 6 Apply rule based logic
        let risks = [];

        // GPA Calculation
        const currentGPA = (avgMarks / 100) * 10.0; 
        const prev = previousGPA ? parseFloat(previousGPA) : currentGPA;
        let predictedGPA = (prev * 0.6) + (currentGPA * 0.4);
        if (predictedGPA > 10) predictedGPA = 10.0;
        if (predictedGPA < 0) predictedGPA = 0.0;

        let performance = "Good";
        if (predictedGPA >= 8.5) performance = "Excellent";
        else if (predictedGPA >= 6.5) performance = "Good";
        else if (predictedGPA >= 5.0) performance = "Average";
        else performance = "At Risk";

        // Additional Risk Logic
        let finalRiskLevel = "Low";
        let riskScore = 0;
        
        // Category Definitions
        let attendanceRisk = "Low";
        if (avgAttendance < 60) { attendanceRisk = "High"; riskScore += 2; }
        else if (avgAttendance < 75) { attendanceRisk = "Medium"; riskScore += 1; }
        
        let assignmentRisk = "Low";
        if (missingAssignments) { assignmentRisk = "High"; riskScore += 2; }
        
        let disciplinaryRisk = "Low";
        if (malpracticeCount >= 2) { disciplinaryRisk = "High"; riskScore += 3; }
        else if (hasMalpractice) { disciplinaryRisk = "Medium"; riskScore += 1; }
        
        let marksRisk = "Low";
        if (avgMarks < 50) { marksRisk = "High"; riskScore += 2; }
        else if (avgMarks < 65) { marksRisk = "Medium"; riskScore += 1; }

        if (predictedGPA < 6.0) { riskScore += 2; }
        
        // Subject-wise detailed breakdown
        const subjectWiseRisks = marksList.map(m => ({
            subject_name: m.subject_name || `Subject ${m.subject_id}`,
            mark: m.internal_mark,
            risk: m.internal_mark < 50 ? "High" : m.internal_mark < 65 ? "Medium" : "Low"
        }));

        if (riskScore === 0) {
            finalRiskLevel = "Low";
        } else if (riskScore <= 3) {
            finalRiskLevel = "Medium";
        } else {
            finalRiskLevel = "High";
        }

        // Standardized Risk & Recommendations Logic
        let suggestions = "";
        if (finalRiskLevel === "High") {
            suggestions = avgAttendance < 75 ? "Attend more regular classes to improve core understanding." : "Focus on weak subjects and practice previous year papers.";
        } else if (finalRiskLevel === "Medium") {
            suggestions = "Participate in classroom discussions and submit all pending assignments.";
        } else {
            suggestions = "Engage in advanced research or leadership roles in team projects.";
        }

        const finalDynamic = await calculateDynamicPrediction(db, studentId, previousGPA);

        // Save/Update the prediction in the DB for persistence
        await db.query(
            `INSERT INTO predictions (student_id, performance_level, risk_level, risk_score_percentage, predicted_gpa, generated_date) 
             VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP) 
             ON DUPLICATE KEY UPDATE 
                performance_level = VALUES(performance_level), 
                risk_level = VALUES(risk_level), 
                risk_score_percentage = VALUES(risk_score_percentage),
                predicted_gpa = VALUES(predicted_gpa),
                generated_date = CURRENT_TIMESTAMP`,
            [studentId, performance, finalRiskLevel, finalDynamic.riskScorePercentage, finalDynamic.predictedGPA]
        );

        // 7 Return prediction result
        res.json({
            student_id: studentId,
            predicted_gpa: finalDynamic.predictedGPA,
            risk_score_percentage: finalDynamic.riskScorePercentage,
            risk_level: finalDynamic.riskLevel,
            metrics: {
                average_marks: finalDynamic.avgMarks,
                average_attendance: finalDynamic.avgAttendance,
                malpractice_count: malpracticeCount,
                has_missing_assignments: missingAssignments
            },
            reason: finalDynamic.primaryFactor,
            suggestions: suggestions,
            performance_level: performance
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate prediction' });
    }
});

// Get prediction history for a student
router.get('/history/:studentId', async (req, res) => {
    try {
        const [rows] = await req.db.query(
            'SELECT * FROM predictions WHERE student_id = ? ORDER BY generated_date DESC', 
            [req.params.studentId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
