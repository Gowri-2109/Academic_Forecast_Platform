const mysql = require('mysql2/promise');

async function migrate() {
    console.log("Starting DB migration...");
    const c = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'academic_forecast',
        multipleStatements: true
    });

    const sql = `
        -- 1. Ensure subjects exist
        INSERT IGNORE INTO subjects (subject_name) 
        SELECT DISTINCT subject FROM marks WHERE subject IS NOT NULL AND subject != '';

        -- 2. Alter marks
        ALTER TABLE marks ADD COLUMN subject_id INT;
        UPDATE marks m JOIN subjects s ON m.subject = s.subject_name SET m.subject_id = s.id;
        ALTER TABLE marks CHANGE marks internal_mark INT;
        ALTER TABLE marks DROP COLUMN subject;

        -- 3. Alter attendance
        TRUNCATE TABLE attendance;
        ALTER TABLE attendance ADD COLUMN subject_id INT;
        ALTER TABLE attendance CHANGE attendance_percentage percentage DECIMAL(5,2);
        ALTER TABLE attendance DROP COLUMN total_classes;
        ALTER TABLE attendance DROP COLUMN attended_classes;

        -- 4. Alter disciplinary_records
        TRUNCATE TABLE disciplinary_records;
        ALTER TABLE disciplinary_records CHANGE incident_type issue_type VARCHAR(100);
        ALTER TABLE disciplinary_records CHANGE incident_date date DATE;
        ALTER TABLE disciplinary_records DROP COLUMN severity_level;
        ALTER TABLE disciplinary_records DROP COLUMN action_taken;
    `;

    try {
        await c.query(sql);
        console.log("Migration successful.");
    } catch(err) {
        console.error("Migration failed:", err);
    } finally {
        await c.end();
    }
}

migrate();
