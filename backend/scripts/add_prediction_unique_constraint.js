const mysql = require('mysql2/promise');

async function migrate() {
    const c = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'academic_forecast'
    });
    try {
        console.log("Adding unique constraint to student_id in predictions table...");
        await c.query('ALTER TABLE predictions ADD UNIQUE (student_id)');
        console.log("Unique constraint added successfully.");
    } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
            console.log("Unique constraint already exists.");
        } else {
            console.error("Migration failed:", err);
        }
    } finally {
        await c.end();
    }
}

migrate();
