const mysql = require('mysql2/promise');

async function migrateDb() {
    const c = await mysql.createConnection({
        host: 'localhost', user: 'root', password: 'root', database: 'academic_forecast'
    });
    try {
        console.log("Checking tables...");
        const [tables] = await c.query('SHOW TABLES');
        console.log("Tables:", tables.map(t => Object.values(t)[0]));

        // Check if `disciplinary_records` exists and alter it
        try {
            await c.query(`ALTER TABLE disciplinary_records ADD COLUMN priority VARCHAR(50) DEFAULT 'Medium', ADD COLUMN status VARCHAR(50) DEFAULT 'Open'`);
            console.log("Added priority and status to disciplinary_records table.");
        } catch(e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("priority/status columns already exist in disciplinary_records.");
            } else {
                console.error("Error altering disciplinary_records:", e.message);
            }
        }

        // Check attendance table structure
        try {
            const [att_cols] = await c.query('SHOW COLUMNS FROM attendance');
            console.log("Attendance columns:", att_cols.map(c => c.Field).join(', '));
            
            // Should we add priority/status to attendance? Wait, attendance isn't an "issue", it's a record. 
            // Better to have an `attendance_issues` table or add an `issue_status` flag, OR just create an `issues` table that aggregates both.
            // Let's create an `attendance_issues` table if it doesn't exist to track priority and status
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
            console.log("attendance_issues table ensured.");

            // Now, insert any student with < 75% attendance into attendance_issues so we have seed data.
            console.log("Seeding attendance_issues...");
            await c.query(`INSERT INTO attendance_issues (student_id, subject_id) 
                SELECT student_id, subject_id FROM attendance 
                WHERE percentage < 75 AND CONCAT(student_id, '-', subject_id) NOT IN 
                (SELECT CONCAT(student_id, '-', subject_id) FROM attendance_issues)
            `);
            console.log("Seeded attendance_issues data.");
        } catch(e) {
            console.error("Error with attendance issues:", e.message);
        }

        // For "Performance Trend", let's create a `past_performance` table to hold semester GPAs
        try {
            await c.query(`
                CREATE TABLE IF NOT EXISTS past_performance (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id INT,
                    semester INT,
                    gpa DECIMAL(3,2),
                    FOREIGN KEY (student_id) REFERENCES students(id)
                )
            `);
            console.log("past_performance table ensured.");

            // Clear and Re-seed for realism
            await c.query('TRUNCATE TABLE past_performance');
            console.log("Seeding realistic past_performance data...");
            const [stus] = await c.query('SELECT id FROM students');
            for (let s of stus) {
                let currentGPA = 6.0 + Math.random() * 2.0; // Base 6.0 - 8.0 for Sem 1
                for (let sem = 1; sem <= 5; sem++) {
                    // Small fluctuation ±0.4
                    const change = (Math.random() * 0.8) - 0.4;
                    currentGPA += change;
                    
                    // Clamping
                    if (currentGPA > 9.5) currentGPA = 9.5;
                    if (currentGPA < 5.0) currentGPA = 5.0;

                    await c.query('INSERT INTO past_performance (student_id, semester, gpa) VALUES (?, ?, ?)', [s.id, sem, currentGPA.toFixed(2)]);
                }
            }
            console.log("Seeded realistic past_performance mock data.");
        } catch(e) {
            console.error("Error creating past_performance:", e.message);
        }

    } catch(e) {
        console.error(e);
    } finally {
        await c.end();
    }
}

migrateDb();
