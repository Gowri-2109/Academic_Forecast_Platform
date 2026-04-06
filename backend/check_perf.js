const mysql = require('mysql2/promise');

async function check() {
    const c = await mysql.createConnection({
        host: 'localhost', user: 'root', password: 'root', database: 'academic_forecast'
    });
    try {
        const [facs] = await c.query("SELECT id FROM users WHERE role IN ('Faculty', 'faculty') LIMIT 1");
        if(facs.length > 0) {
            const facId = facs[0].id;
            console.log("Checking for faculty_id:", facId);
            const [perfRows] = await c.query(
                `SELECT s.subject_name, AVG(m.internal_mark) as average_marks
                 FROM marks m
                 JOIN subjects s ON m.subject_id = s.id
                 JOIN student_assignments sa ON m.student_id = sa.student_id
                 WHERE sa.faculty_id = ?
                 GROUP BY s.id`,
                [facId]
            );
            console.log("Perf Rows:", perfRows);
        }
    } catch(e) { console.error(e); }
    finally { await c.end(); }
}
check();
