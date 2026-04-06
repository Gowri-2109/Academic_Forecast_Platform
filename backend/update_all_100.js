const mysql = require('mysql2/promise');

async function updateDB() {
    const c = await mysql.createConnection({
        host: 'localhost', user: 'root', password: 'root', database: 'academic_forecast'
    });
    try {
        console.log("Updating faculty emails...");
        const [facs] = await c.query(`SELECT u.id, f.first_name, u.email, u.name as fullname FROM users u JOIN faculty_profiles f ON u.id = f.user_id WHERE u.role = 'Faculty'`);
        for (let f of facs) {
            let base = f.first_name ? f.first_name.replace(/[^a-zA-Z]/g, '').toLowerCase() : f.fullname.split(' ')[0].toLowerCase().replace(/[^a-zA-Z]/g, '');
            let email = base + '@bitsathy.ac.in';
            await c.query(`UPDATE users SET email = ? WHERE id = ?`, [email, f.id]);
        }
        
        console.log("Checking for Artificial Intelligence Subject...");
        let [aiSub] = await c.query(`SELECT id FROM subjects WHERE subject_name LIKE '%Artificial Intelligence%'`);
        if (aiSub.length === 0) {
            await c.query(`INSERT INTO subjects (course_code, subject_name) VALUES ('CS808', 'Artificial Intelligence and machine learning')`);
        }

        try {
            await c.query('ALTER TABLE attendance ADD COLUMN classes_attended INT DEFAULT 0, ADD COLUMN total_classes INT DEFAULT 50');
            console.log("Added missing attendance columns.");
        } catch(e) { }

        console.log("Generating marks, attendance, and predictions for all students...");
        const [stus] = await c.query(`SELECT id FROM students`);
        const [subjects] = await c.query(`SELECT id FROM subjects`);
        
        // Clean old marks to refresh variance
        await c.query('DELETE FROM marks WHERE student_id IN (SELECT id FROM students)');
        await c.query('DELETE FROM attendance WHERE student_id IN (SELECT id FROM students)');
        await c.query('DELETE FROM predictions WHERE student_id IN (SELECT id FROM students)');

        for (let s of stus) {
            let total = 0;
            for (let sub of subjects) {
                // Varying percentages: some high, some low
                let rand = Math.random();
                let mark = rand > 0.85 ? (Math.floor(Math.random() * 20) + 30) : (Math.floor(Math.random() * 30) + 70);
                total += mark;
                await c.query(`INSERT INTO marks (student_id, subject_id, internal_mark) VALUES (?, ?, ?)`, [s.id, sub.id, mark]);
                
                let attPerc = rand > 0.85 ? (Math.floor(Math.random() * 20) + 40) : (Math.floor(Math.random() * 30) + 70); 
                let classesAttended = Math.floor(50 * (attPerc / 100));
                await c.query(`INSERT INTO attendance (student_id, subject_id, percentage, classes_attended, total_classes) VALUES (?, ?, ?, ?, ?)`, [s.id, sub.id, attPerc, classesAttended, 50]);
            }
            if (subjects.length > 0) {
                let avg = total / subjects.length;
                let risk = avg < 50 ? 'High Risk' : (avg < 75 ? 'Attendance Risk' : 'None');
                let perf = avg > 85 ? 'Excellent' : (avg > 50 ? 'Good' : 'Needs Improvement');
                await c.query(`INSERT INTO predictions (student_id, performance_level, risk_level) VALUES (?, ?, ?)`, [s.id, perf, risk]);
            }
        }
        console.log("Database update done. Marks and emails have been assigned.");
    } catch(e) { console.error(e); }
    finally { await c.end(); }
}
updateDB();
