const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'academic_forecast'
    });

    try {
        console.log("Adding previousGPA column...");
        await db.query('ALTER TABLE students ADD COLUMN previousGPA DECIMAL(3,2)');
        console.log("Column added. Now populating existing records...");
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists. Populating NULL rows...");
        } else {
            console.error(e);
            process.exit(1);
        }
    }

    const [rows] = await db.query('SELECT id FROM students WHERE previousGPA IS NULL');
    for (const row of rows) {
        const randGpa = (Math.random() * (9.0 - 6.0) + 6.0).toFixed(2);
        await db.query('UPDATE students SET previousGPA = ? WHERE id = ?', [randGpa, row.id]);
    }
    
    console.log(`Updated ${rows.length} rows with random previousGPA.`);
    await db.end();
}

migrate();
