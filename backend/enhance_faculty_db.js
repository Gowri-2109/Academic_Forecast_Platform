const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const c = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'academic_forecast'
    });

    try {
        console.log('Starting migration...');

        // 1. Update disciplinary_records
        console.log('Updating disciplinary_records...');
        try {
            await c.query(`ALTER TABLE disciplinary_records ADD COLUMN priority VARCHAR(50) DEFAULT 'Medium'`);
        } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }
        
        try {
            await c.query(`ALTER TABLE disciplinary_records ADD COLUMN status VARCHAR(50) DEFAULT 'Open'`);
        } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }

        // 2. Update attendance table to include raw counts
        console.log('Updating attendance table...');
        try {
            await c.query(`ALTER TABLE attendance ADD COLUMN present_classes INT DEFAULT 0`);
        } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }
        
        try {
            await c.query(`ALTER TABLE attendance ADD COLUMN total_classes INT DEFAULT 50`);
        } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }

        // Initialize counts based on percentage if they are 0
        console.log('Initializing attendance counts from percentages...');
        await c.query(`
            UPDATE attendance 
            SET present_classes = ROUND((percentage / 100) * total_classes)
            WHERE present_classes = 0 AND percentage > 0
        `);

        // 3. Ensure attendance_issues exists (from previous plans)
        console.log('Ensuring attendance_issues exists...');
        await c.query(`
            CREATE TABLE IF NOT EXISTS attendance_issues (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT,
                subject_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                priority VARCHAR(50) DEFAULT 'Medium',
                status VARCHAR(50) DEFAULT 'Open',
                resolved_by INT NULL, 
                FOREIGN KEY (student_id) REFERENCES students(id),
                FOREIGN KEY (subject_id) REFERENCES subjects(id)
            )
        `);

        console.log('Migration finished successfully.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await c.end();
    }
}

migrate();
