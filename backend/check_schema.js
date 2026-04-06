const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
    const c = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'academic_forecast'
    });

    try {
        const tables = ['disciplinary_records', 'attendance', 'faculty_assignments', 'students', 'student_assignments'];
        for (const table of tables) {
            console.log(`--- Table: ${table} ---`);
            const [cols] = await c.query(`DESCRIBE ${table}`);
            console.log(JSON.stringify(cols, null, 2));
        }
    } catch (err) {
        console.error('Error checking schema:', err.message);
    } finally {
        await c.end();
    }
}

checkSchema();
