const mysql = require('mysql2/promise');

async function check() {
    const c = await mysql.createConnection({
        host: 'localhost', user: 'root', password: 'root', database: 'academic_forecast'
    });
    try {
        const [rows] = await c.query(`
            SELECT d.*, s.name as student_name, s.register_number, s.department, s.year
            FROM disciplinary_records d
            LEFT JOIN students s ON d.student_id = s.id
            ORDER BY s.register_number ASC, d.date DESC
        `);
        console.log("Joined disciplinary data:", rows.slice(0, 3));
    } catch(e) { console.error(e); }
    finally { await c.end(); }
}
check();
