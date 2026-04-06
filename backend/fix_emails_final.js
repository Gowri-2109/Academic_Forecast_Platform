const mysql = require('mysql2/promise');

async function run() {
    const c = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'academic_forecast'
    });

    console.log('Fetching all users...');
    const [users] = await c.query(`
        SELECT id, name, role FROM users
    `);

    const usedEmails = new Set();
    const updates = [];

    // Helper to generate unique email
    function getUniqueEmail(base, set) {
        let email = base;
        let counter = 1;
        while (set.has(email)) {
            const parts = base.split('@');
            email = `${parts[0]}${counter}@${parts[1]}`;
            counter++;
        }
        set.add(email);
        return email;
    }

    // 1. Separate students and faculty
    const students = users.filter(u => u.role === 'student');
    const faculty = users.filter(u => u.role === 'faculty' || u.role === 'Faculty');

    console.log(`Processing ${students.length} students...`);
    for (const u of students) {
        const nameParts = u.name.trim().split(/\s+/);
        const firstName = nameParts[0].toLowerCase().replace(/[^a-z]/g, '');
        const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0].toLowerCase() : '';
        
        let baseEmail = `${firstName}.ec23@bitsathy.ac.in`;
        
        // Custom collision logic for students: try name+initial first
        let email = baseEmail;
        if (usedEmails.has(email) && lastInitial) {
             email = `${firstName}${lastInitial}.ec23@bitsathy.ac.in`;
        }
        
        // If still taken, use standard unique logic
        email = getUniqueEmail(email, usedEmails);
        updates.push({ id: u.id, email });
    }

    console.log(`Processing ${faculty.length} faculty...`);
    for (const u of faculty) {
        const cleanName = u.name.replace(/^(Mr\.|Mrs\.|Dr\.)\s+/i, '').replace(/\s+/g, '').toLowerCase().replace(/[^a-z]/g, '');
        let baseEmail = `${cleanName}@bitsathy.ac.in`;
        let email = getUniqueEmail(baseEmail, usedEmails);
        updates.push({ id: u.id, email });
    }

    // 2. Perform updates using a transaction or one-by-one with error handling
    console.log(`Executing ${updates.length} updates...`);
    
    // To avoid unique constraint errors mid-way (e.g. updating A to B while B exists but will be C later),
    // we set all emails to a temp value first or just use a safe order.
    // Or simpler: disable foreign key checks and update.
    
    await c.query('SET FOREIGN_KEY_CHECKS = 0');
    // To solve the "circular" update problem, we first append .tmp to all existing emails
    await c.query('UPDATE users SET email = CONCAT(email, ".tmp")');
    
    for (const item of updates) {
        try {
            await c.query('UPDATE users SET email = ? WHERE id = ?', [item.email, item.id]);
        } catch (err) {
            console.error(`Failed to update user ${item.id}:`, err.message);
        }
    }
    await c.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Finished standardization.');
    await c.end();
}

run();
