const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const missingFaculties = [
    { name: 'ARUN KUMAR R', dept: 'AIDS' },
    { name: 'NALIFABEGAM J', dept: 'ECE' },
    { name: 'LEEBAN MOSES M', dept: 'ECE' },
    { name: 'ARULMURUGAN L', dept: 'ECE' },
    { name: 'RAGAVI M', dept: 'ECE' }
];

async function run() {
    const c = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'academic_forecast'
    });

    console.log('Checking for missing faculties...');
    const hashedPassword = await bcrypt.hash('faculty123', 10);

    for (const f of missingFaculties) {
        const [rows] = await c.query('SELECT id FROM users WHERE name LIKE ?', [`%${f.name}%`]);
        if (rows.length === 0) {
            console.log(`Creating faculty: ${f.name}`);
            const [userRes] = await c.query(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [f.name, `${f.name.toLowerCase().replace(/\s+/g, '')}@faculty.com`, hashedPassword, 'faculty']
            );
            const userId = userRes.insertId;
            
            // Also create profile
            const names = f.name.split(' ');
            const firstName = names[0];
            const lastName = names.slice(1).join(' ');
            await c.query(
                'INSERT INTO faculty_profiles (user_id, first_name, last_name, department) VALUES (?, ?, ?, ?)',
                [userId, firstName, lastName, f.dept === 'ECE' ? 'ELECTRONICS AND COMMUNICATION ENGINEERING' : 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE']
            );
        } else {
            console.log(`Faculty exists: ${f.name} (ID: ${rows[0].id})`);
        }
    }

    await c.end();
}

run();
