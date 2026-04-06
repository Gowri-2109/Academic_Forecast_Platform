const mysql = require('mysql2/promise');

async function test() {
    try {
        const c = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'academic_forecast'
        });
        
        const faculty_id = 413; // Just a test ID
        const student_ids = [376, 377, 378];

        console.log('Testing update with IN (?) ...');
        // In mysql2, the correct way for IN with an array is:
        const [result] = await c.query(
            'UPDATE students SET faculty_id = ? WHERE id IN (?)',
            [faculty_id, student_ids]
        );
        console.log('Update result:', result.info);
        
        await c.end();
    } catch (e) {
        console.error('FAILED:', e.message);
    }
}
test();
