const mysql = require('mysql2/promise');

async function run() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'academic_forecast'
    });

    try {
        console.log('Fetching students...');
        const [students] = await db.query('SELECT id, name, previousGPA FROM students');
        console.log(`Processing ${students.length} students...`);

        for (const s of students) {
            // 1. Marks
            const [marksList] = await db.query('SELECT internal_mark FROM marks WHERE student_id = ?', [s.id]);
            let avgMarks = marksList.length > 0 ? (marksList.reduce((acc, m) => acc + m.internal_mark, 0) / marksList.length) : 0;
            
            // 2. Attendance
            const [attList] = await db.query('SELECT classes_attended, total_classes FROM attendance WHERE student_id = ?', [s.id]);
            let avgAttendance = 0;
            if (attList.length > 0) {
                const total = attList.reduce((acc, a) => acc + a.total_classes, 0);
                const attended = attList.reduce((acc, a) => acc + a.classes_attended, 0);
                avgAttendance = (attended / total) * 100;
            }

            // 3. GPA Calculation
            const currentGPA = (avgMarks / 100) * 10.0; 
            const prev = s.previousGPA ? parseFloat(s.previousGPA) : currentGPA;
            let predictedGPA = (prev * 0.6) + (currentGPA * 0.4);
            if (predictedGPA > 10) predictedGPA = 10.0;

            // 4. Risk Level
            let riskScore = 0;
            if (avgAttendance < 75) riskScore += (avgAttendance < 60 ? 2 : 1);
            if (avgMarks < 65) riskScore += (avgMarks < 50 ? 2 : 1);
            if (predictedGPA < 6.0) riskScore += 1;

            let riskLevel = riskScore === 0 ? "Low" : (riskScore <= 2 ? "Medium" : "High");
            
            let perf = "Good";
            if (predictedGPA >= 8.5) perf = "Excellent";
            else if (predictedGPA >= 6.5) perf = "Good";
            else if (predictedGPA >= 5.0) perf = "Average";
            else perf = "At Risk";

            await db.query(
                `INSERT INTO predictions (student_id, performance_level, risk_level, predicted_gpa, generated_date) 
                 VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) 
                 ON DUPLICATE KEY UPDATE performance_level = VALUES(performance_level), risk_level = VALUES(risk_level), predicted_gpa = VALUES(predicted_gpa), generated_date = CURRENT_TIMESTAMP`,
                [s.id, perf, riskLevel, predictedGPA]
            );
        }
        console.log('All predictions updated successfully.');
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}
run();
