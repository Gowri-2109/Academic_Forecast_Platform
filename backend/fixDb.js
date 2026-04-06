const mysql = require('mysql2/promise');

async function fixDb() {
    const c = await mysql.createConnection({
        host: 'localhost', user: 'root', password: 'root', database: 'academic_forecast'
    });
    try {
        console.log("Removing duplicate predictions...");
        // Keep the LATEST prediction (max id) for each student
        const [res] = await c.query(`
            DELETE t1 FROM predictions t1
            INNER JOIN predictions t2 
            WHERE t1.id < t2.id AND t1.student_id = t2.student_id;
        `);
        console.log("Deleted duplicate predictions:", res.affectedRows);
        
        // Add unique constraint so it doesn't happen again
        await c.query(`ALTER TABLE predictions ADD UNIQUE KEY unique_student_pred(student_id)`);
        console.log("Unique constraint added to predictions.");
    } catch(e) { console.error(e); }
    finally { await c.end(); }
}
fixDb();
