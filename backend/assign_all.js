const mysql = require('mysql2/promise');

async function checkAndAssign() {
    const c = await mysql.createConnection({
        host: 'localhost', user: 'root', password: 'root', database: 'academic_forecast'
    });
    try {
        console.log("Assigning all students evenly to faculties...");
        const [faculties] = await c.query("SELECT id FROM users WHERE role IN ('Faculty', 'faculty')");
        const [students] = await c.query("SELECT id FROM students");
        
        if (faculties.length > 0) {
            let facIdx = 0;
            for (let s of students) {
                let fId = faculties[facIdx].id;
                await c.query("UPDATE students SET faculty_id = ? WHERE id = ?", [fId, s.id]);
                facIdx = (facIdx + 1) % faculties.length;
            }
            console.log(`Assigned ${students.length} students across ${faculties.length} faculties.`);
        } else {
            console.log("No faculties found to assign!");
        }
    } catch(e) { console.error(e); }
    finally { await c.end(); }
}
checkAndAssign();
