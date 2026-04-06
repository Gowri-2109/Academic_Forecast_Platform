const mysql = require('mysql2/promise');

async function fix() {
    try {
        const c = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'academic_forecast'
        });

        console.log('Updating all students to Year 3, Semester 6...');
        await c.query('UPDATE students SET semester = 6, year = 3');

        console.log('Identifying and removing invalid faculty assignments (those pointing to students)...');
        // Join with users to find roles
        const [invalid] = await c.query(`
            SELECT s.id, s.name, s.faculty_id, u.role
            FROM students s
            JOIN users u ON s.faculty_id = u.id
            WHERE u.role != 'faculty' AND u.role != 'Faculty'
        `);
        
        console.log(`Found ${invalid.length} invalid assignments.`);
        if (invalid.length > 0) {
            const ids = invalid.map(i => i.id);
            await c.query('UPDATE students SET faculty_id = NULL WHERE id IN (?)', [ids]);
            console.log('Cleared invalid faculty_ids.');
        }

        // Also check for null faculty_id or those cleared above, and assign to a default real faculty if possible
        const [faculties] = await c.query("SELECT id FROM users WHERE role = 'faculty' OR role = 'Faculty' LIMIT 1");
        if (faculties.length > 0) {
             const defaultFacultyId = faculties[0].id;
             console.log(`Assigning unassigned students to default faculty (ID: ${defaultFacultyId})...`);
             await c.query('UPDATE students SET faculty_id = ? WHERE faculty_id IS NULL', [defaultFacultyId]);
        }

        await c.end();
        console.log('Database fix completed.');
    } catch (e) {
        console.error(e.message);
    }
}
fix();
