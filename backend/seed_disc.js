const mysql = require('mysql2/promise');

async function seedDisc() {
    const c = await mysql.createConnection({
        host: 'localhost', user: 'root', password: 'root', database: 'academic_forecast'
    });
    try {
        await c.query('SET FOREIGN_KEY_CHECKS=0');
        console.log("Clearing old dummy disciplinary records...");
        await c.query('DELETE FROM disciplinary_records');
        await c.query('ALTER TABLE disciplinary_records AUTO_INCREMENT = 1');

        console.log("Fetching faculties...");
        const [faculties] = await c.query("SELECT DISTINCT faculty_id FROM student_assignments");

        for (const faculty of faculties) {
            const [students] = await c.query("SELECT student_id FROM student_assignments WHERE faculty_id = ? LIMIT 2", [faculty.faculty_id]);
            
            for (const s of students) {
                // Insert 1 disciplinary record for this student
                await c.query(`
                    INSERT INTO disciplinary_records (student_id, issue_type, description) 
                    VALUES (?, ?, ?)
                `, [s.student_id, 'Attendance Shortage', 'Student has been marked as a chronic absentee risk.']);
            }
            console.log(`Seeded 2 disciplinary records for faculty ${faculty.faculty_id}`);
        }
        
        await c.query('SET FOREIGN_KEY_CHECKS=1');
        console.log("Done.");
    } catch(e) { console.error(e); }
    finally { await c.end(); }
}
seedDisc();
