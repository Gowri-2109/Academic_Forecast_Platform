const mysql = require('mysql2/promise');

async function test() {
    try {
        const c = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'academic_forecast'
        });
        const [rows] = await c.query('SELECT u.id, u.name, f.first_name, f.last_name, f.department FROM users u LEFT JOIN faculty_profiles f ON u.id = f.user_id WHERE u.role = "faculty" OR u.role = "Faculty"');
        console.log(JSON.stringify(rows, null, 2));
        await c.end();
    } catch (e) {
        console.error(e.message);
    }
}
test();
