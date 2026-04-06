const mysql = require('mysql2/promise');

async function migrate() {
    const c = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'academic_forecast'
    });
    try {
        console.log("Checking columns in predictions table...");
        const [cols] = await c.query('SHOW COLUMNS FROM predictions');
        const colNames = cols.map(col => col.Field);

        if (!colNames.includes('risk_score_percentage')) {
            console.log("Adding risk_score_percentage column...");
            await c.query('ALTER TABLE predictions ADD COLUMN risk_score_percentage INT DEFAULT 0');
        }
        if (!colNames.includes('predicted_gpa')) {
            console.log("Adding predicted_gpa column...");
            await c.query('ALTER TABLE predictions ADD COLUMN predicted_gpa DECIMAL(3,2) DEFAULT 0.00');
        }
        console.log("Database update complete.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await c.end();
    }
}

migrate();
