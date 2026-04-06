const mysql = require('mysql2/promise');

async function test() {
    try {
        const c = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'academic_forecast'
        });
        const [rows] = await c.query(`
            SELECT s.register_number, s.name, s.semester, s.faculty_id, f.name as faculty_name, f.role as faculty_role 
            FROM students s 
            LEFT JOIN users f ON s.faculty_id = f.id 
            WHERE s.register_number LIKE "7376231EC10%"
            LIMIT 20
        `);
        console.log(JSON.stringify(rows, null, 2));
        await c.end();
    } catch (e) {
        console.error(e.message);
    }
}
test();
