const mysql = require('mysql2/promise');

async function check() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'academic_forecast'
    });

    console.log("Checking Hariharan...");
    const [users] = await db.query('SELECT * FROM users WHERE email LIKE "%hariharan.ec23%"');
    console.log("Users:", users);
    if(users.length > 0) {
        const studentId = users[0].id; // assuming id in users maps to id in students
        
        const [student] = await db.query('SELECT * FROM students WHERE id = ?', [studentId]);
        console.log("Student:", student);

        const [sa] = await db.query('SELECT * FROM student_assignments WHERE student_id = ?', [student[0].id]);
        console.log("Student assignments for Hariharan:", sa);

        if(sa.length > 0) {
            const facultyId = sa[0].faculty_id;
            console.log("Faculty ID:", facultyId);
            
            const [fa] = await db.query('SELECT * FROM faculty_assignments WHERE faculty_id = ?', [facultyId]);
            console.log("Faculty assignments:", fa);
            
            const [fas] = await db.query('SELECT * FROM faculty_assignment_students WHERE student_id = ?', [student[0].id]);
            console.log("Faculty assignment students:", fas);
        }
        
        const [marks] = await db.query('SELECT m.*, s.subject_name, s.course_code FROM marks m JOIN subjects s ON m.subject_id = s.id WHERE m.student_id = ?', [studentId]);
        console.log("Marks API Response:", marks);

    console.log("Adding missing column submission_date to faculty_assignment_students...");
    try {
        await db.query('ALTER TABLE faculty_assignment_students ADD COLUMN submission_date TIMESTAMP NULL');
        console.log("Column added successfully.");
    } catch (e) {
        console.log("Column might already exist or error:", e.message);
    }
    
    // Testing assigns again
    try {
        const [assigns] = await db.query('SELECT fa.*, fas.status, fas.score, fas.submission_date FROM faculty_assignment_students fas JOIN faculty_assignments fa ON fas.assignment_id = fa.id WHERE fas.student_id = ? ORDER BY fa.deadline ASC', [studentId]);
        console.log("Assignments API Response:", assigns);
    } catch (e) {
        console.log("Still failing:", e.message);
    }
    } // close if

    await db.end();
}
check().catch(console.error);
