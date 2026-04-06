const mysql = require('mysql2/promise');
async function test() {
    try {
        const db = await mysql.createConnection({host: 'localhost', user: 'root', password: 'root', database: 'academic_forecast'});
        const [rows] = await db.query('SELECT m.*, s.subject_name, s.course_code FROM marks m JOIN subjects s ON m.subject_id = s.id LIMIT 2');
        console.log("SUCCESS! Rows:", rows);
        await db.end();
    } catch(e) { console.error("FAILED:", e); }
}
test();
