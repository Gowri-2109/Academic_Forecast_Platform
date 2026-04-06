const mysql = require('mysql2/promise');

async function fixDupes() {
    const c = await mysql.createConnection({
        host: 'localhost', user: 'root', password: 'root', database: 'academic_forecast'
    });
    try {
        console.log("Removing duplicates...");
        // Keep only the minimum id for each student_id
        await c.query(`
            DELETE t1 FROM student_assignments t1
            INNER JOIN student_assignments t2 
            WHERE t1.id > t2.id AND t1.student_id = t2.student_id;
        `);
        console.log("Duplicates removed. Adding unique constraint...");
        // Add unique constraint
        await c.query(`ALTER TABLE student_assignments ADD UNIQUE KEY unique_student(student_id)`);
        console.log("Unique constraint added.");
    } catch(e) { console.error(e); }
    finally { await c.end(); }
}
fixDupes();
