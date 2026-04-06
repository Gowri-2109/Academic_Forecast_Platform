const mysql = require('mysql2/promise');

async function fixSubjectMarks() {
    const c = await mysql.createConnection({
        host: 'localhost', user: 'root', password: 'root', database: 'academic_forecast'
    });
    try {
        console.log("Checking for Artificial Intelligence Subject...");
        let [aiSub] = await c.query(`SELECT id FROM subjects WHERE subject_name LIKE '%Artificial Intelligence%'`);
        let aiSubId;
        if (aiSub.length === 0) {
            console.log("Inserting AI subject...");
            const [res] = await c.query(`INSERT INTO subjects (course_code, subject_name) VALUES ('CS808', 'Artificial Intelligence and machine learning')`);
            aiSubId = res.insertId;
        } else {
            aiSubId = aiSub[0].id;
        }

        const [stus] = await c.query(`SELECT id FROM students`);
        const [subjects] = await c.query(`SELECT id, subject_name FROM subjects`);
        
        console.log("Deleting old marks...");
        await c.query('DELETE FROM marks WHERE student_id IN (SELECT id FROM students)');
        
        console.log("Generating varied marks...");
        // Decide which subjects will intentionally have low pass rates (e.g., < 50%)
        // Let's make AI and one other subject fail a lot of students
        const lowPassSubjects = [aiSubId];
        if (subjects.length > 1) {
            const anotherSub = subjects.find(s => s.id !== aiSubId);
            if (anotherSub) lowPassSubjects.push(anotherSub.id);
        }

        for (let s of stus) {
            for (let sub of subjects) {
                let mark;
                if (lowPassSubjects.includes(sub.id)) {
                    // 60% chance to fail (mark between 20 and 49)
                    // 40% chance to pass (mark between 50 and 80)
                    let rand = Math.random();
                    mark = rand < 0.60 ? (Math.floor(Math.random() * 30) + 20) : (Math.floor(Math.random() * 31) + 50);
                } else {
                    // Normal distribution: 15% fail, 85% pass
                    let rand = Math.random();
                    mark = rand < 0.15 ? (Math.floor(Math.random() * 20) + 30) : (Math.floor(Math.random() * 30) + 70);
                }
                
                await c.query(`INSERT INTO marks (student_id, subject_id, internal_mark) VALUES (?, ?, ?)`, [s.id, sub.id, mark]);
            }
        }
        console.log("Marks updated successfully.");
    } catch(e) { 
        console.error(e); 
    } finally { 
        await c.end(); 
    }
}
fixSubjectMarks();
