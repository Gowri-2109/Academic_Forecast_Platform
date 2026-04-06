const mysql = require('mysql2/promise');

async function run() {
    const c = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'academic_forecast',
        multipleStatements: true
    });

    try {
        console.log('Fetching students and subjects...');
        const [students] = await c.query('SELECT id, name FROM students');
        const [subjects] = await c.query('SELECT id FROM subjects');
        
        console.log(`Clearing existing performance data for fresh seed (${students.length} students)...`);
        await c.query('DELETE FROM marks');
        await c.query('DELETE FROM attendance');
        await c.query('DELETE FROM predictions'); // Clear to recalculate later

        const marksValues = [];
        const attendanceValues = [];

        for (const s of students) {
            const rand = Math.random();
            let performanceLevel; 
            if (rand > 0.8) performanceLevel = 2; // At Risk
            else if (rand > 0.5) performanceLevel = 1; // Medium
            else performanceLevel = 0; // High

            for (const sub of subjects) {
                let marks, attendance;
                
                if (performanceLevel === 0) {
                    marks = Math.floor(Math.random() * (100 - 80) + 80);
                    attendance = Math.floor(Math.random() * (45 - 40) + 40); 
                } else if (performanceLevel === 1) {
                    marks = Math.floor(Math.random() * (85 - 60) + 60);
                    attendance = Math.floor(Math.random() * (42 - 35) + 35);
                } else {
                    marks = Math.floor(Math.random() * (65 - 30) + 30);
                    attendance = Math.floor(Math.random() * (35 - 25) + 25);
                }

                marksValues.push([s.id, sub.id, marks]);
                attendanceValues.push([s.id, sub.id, 45, attendance]);
            }
        }

        console.log(`Inserting ${marksValues.length} mark records...`);
        const batchSize = 1000;
        for (let i = 0; i < marksValues.length; i += batchSize) {
            const batch = marksValues.slice(i, i + batchSize);
            await c.query('INSERT INTO marks (student_id, subject_id, internal_mark) VALUES ?', [batch]);
        }

        console.log(`Inserting ${attendanceValues.length} attendance records...`);
        for (let i = 0; i < attendanceValues.length; i += batchSize) {
            const batch = attendanceValues.slice(i, i + batchSize);
            await c.query('INSERT INTO attendance (student_id, subject_id, total_classes, classes_attended) VALUES ?', [batch]);
        }

        console.log('Performance data population finished successfully.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await c.end();
    }
}

run();
