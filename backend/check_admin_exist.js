const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAdmin() {
    const c = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'academic_forecast'
    });

    try {
        const [users] = await c.query("SELECT id, name, email, role, password FROM users WHERE role = 'Admin'");
        console.log('Admin Users found:', JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('Error checking admin:', err.message);
    } finally {
        await c.end();
    }
}

checkAdmin();
