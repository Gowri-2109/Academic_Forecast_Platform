const mysql = require('mysql2/promise');

async function fixIssues() {
    const c = await mysql.createConnection({
        host: 'localhost', user: 'root', password: 'root', database: 'academic_forecast'
    });
    try {
        console.log("Cleaning orphaned disciplinary records...");
        await c.query('DELETE FROM disciplinary_records WHERE student_id NOT IN (SELECT id FROM students)');
        
        const [stus] = await c.query('SELECT id FROM students LIMIT 8');
        for (let i = 0; i < stus.length; i++) {
            let sid = stus[i].id;
            let issues = ['Late Submission', 'Misbehavior', 'Dress Code'];
            let desc = ['Consistent delay in updates.', 'Disrupted the class repeatedly.', 'Did not follow the mandated format.'];
            await c.query(
                'INSERT INTO disciplinary_records (student_id, issue_type, description, date) VALUES (?, ?, ?, CURDATE())',
                [sid, issues[i%3], desc[i%3]]
            );
        }
        console.log("Seeded new valid disciplinary records.");
    } catch(e) { console.error(e); }
    finally { await c.end(); }
}
fixIssues();
