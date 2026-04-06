const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function fixAdmin() {
    const c = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'academic_forecast'
    });

    try {
        console.log('Fixing admin account...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Let's first identify all admin-like accounts
        const [admins] = await c.query(
            "SELECT id FROM users WHERE role = 'admin' OR email LIKE 'admin%@college.edu.tmp' OR email LIKE 'admin%@forecast.com.tmp' OR email = 'admin@college.edu'"
        );
        
        if (admins.length > 1) {
            console.log(`Found ${admins.length} admin accounts. Consolidating into one...`);
            // Keep the one with the highest ID (likely the most recent or the one we want)
            const idsToDelete = admins.slice(0, admins.length - 1).map(u => u.id);
            await c.query("DELETE FROM users WHERE id IN (?)", [idsToDelete]);
            console.log(`Deleted redundant admin accounts with IDs: ${idsToDelete.join(', ')}`);
        }
        
        // Now update the remaining one (or insert if none existed)
        const [finalAdmins] = await c.query("SELECT id FROM users WHERE role = 'admin' OR role = 'Admin' OR email = 'admin@college.edu' LIMIT 1");
        
        if (finalAdmins.length === 1) {
            const adminId = finalAdmins[0].id;
            await c.query(
                "UPDATE users SET email = 'admin@college.edu', role = 'Admin', password = ? WHERE id = ?",
                [hashedPassword, adminId]
            );
            console.log(`Successfully updated admin account (ID: ${adminId}) to admin@college.edu / admin123`);
        } else {
            console.log('No admin account found. Creating a new one...');
            await c.query(
                "INSERT INTO users (name, email, password, role) VALUES ('Admin User', 'admin@college.edu', ?, 'Admin')",
                [hashedPassword]
            );
            console.log('New admin account created: admin@college.edu / admin123');
        }
    } catch (err) {
        console.error('Error fixing admin:', err.message);
    } finally {
        await c.end();
    }
}

fixAdmin();
