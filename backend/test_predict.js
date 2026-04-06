const mysql = require('mysql2/promise');

async function test() {
    const db = await mysql.createConnection({
        host: 'localhost', user: 'root', password: 'root', database: 'academic_forecast'
    });
    try {
        const [stuRes] = await db.query('SELECT id FROM students LIMIT 1');
        const studentId = stuRes[0].id;
        
        console.log("Using student ID:", studentId);
        
        const performance = "Good";
        const finalRiskLevel = "Low";

        console.log("Attempting ON DUPLICATE KEY UPDATE...");
        const [insertResult] = await db.query(
            `INSERT INTO predictions (student_id, performance_level, risk_level, generated_date) 
             VALUES (?, ?, ?, CURRENT_TIMESTAMP) 
             ON DUPLICATE KEY UPDATE performance_level = VALUES(performance_level), risk_level = VALUES(risk_level), generated_date = CURRENT_TIMESTAMP`,
            [studentId, performance, finalRiskLevel]
        );
        console.log("Success! Insert ID / Update:", insertResult);
    } catch (e) {
        console.error("SQL Error:", e);
    } finally {
        await db.end();
    }
}
test();
