const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function seed() {
    console.log("Connecting to database to seed data...");
    const c = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'academic_forecast'
    });

    try {
        const hashedPassword = await bcrypt.hash('password123', 10);

        console.log("Cleaning up old seed data...");
        // Disable foreign key checks temporarily to allow wiping the seed users without constraint errors since we just want a clean slate for mock data.
        await c.query(`SET FOREIGN_KEY_CHECKS = 0`);
        await c.query(`DELETE FROM users WHERE email LIKE 'faculty%@college.edu' OR email LIKE 'student%@demo.edu'`);
        await c.query(`DELETE FROM students WHERE register_number LIKE 'DEMO2026%'`);
        await c.query(`SET FOREIGN_KEY_CHECKS = 1`);

        console.log("Generating 10 Faculty members...");
        let facultyIds = [];
        for(let i=1; i<=10; i++) {
            const [uRes] = await c.query(
                `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
                [`Dr. Example Faculty ${i}`, `faculty${i}@college.edu`, hashedPassword, 'Faculty']
            );
            const fid = uRes.insertId;
            facultyIds.push(fid);
            await c.query(
                `INSERT INTO faculty_profiles (user_id, first_name, last_name, department) VALUES (?, ?, ?, ?)`,
                [fid, `Dr. Example`, `Faculty ${i}`, `Computer Science`]
            );
        }
        console.log("Generating 10 Students for EACH faculty (100 total)...");
        let allStudentIds = [];
        let globalStudentCounter = 1;

        // Fetch subjects
        const [subjects] = await c.query(`SELECT id FROM subjects`);
        if(subjects.length === 0) {
            console.log("No subjects found. Please ensure subjects exist first.");
            return;
        }

        for (let targetFacultyId of facultyIds) {
            let facultyStudentIds = [];
            
            for(let i=1; i<=10; i++) {
                const [uRes] = await c.query(
                    `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
                    [`Student User ${globalStudentCounter}`, `student${globalStudentCounter}@demo.edu`, hashedPassword, 'Student']
                );
                const sid = uRes.insertId;
                
                await c.query(
                    `INSERT INTO students (id, name, register_number, department, semester) VALUES (?, ?, ?, ?, ?)`,
                    [sid, `Student User ${globalStudentCounter}`, `DEMO2026${globalStudentCounter.toString().padStart(3, '0')}`, `Computer Science`, 4]
                );
                facultyStudentIds.push(sid);
                allStudentIds.push(sid);
                globalStudentCounter++;

                // Assign to the specific faculty
                await c.query(
                    `INSERT INTO student_assignments (faculty_id, student_id) VALUES (?, ?)`,
                    [targetFacultyId, sid]
                );
            }
            
            // Seed marks, etc. for these 10 students
            for (let sid of facultyStudentIds) {
                let totalMarks = 0;
                for (let sub of subjects) {
                    const mark = Math.floor(Math.random() * 40) + 60; // 60 to 100
                    totalMarks += mark;
                    await c.query(`INSERT INTO marks (student_id, subject_id, internal_mark) VALUES (?, ?, ?)`, [sid, sub.id, mark]);
                    
                    // Generate attendance from 45% to 100% so we have some below 60%
                    const attendance = Math.floor(Math.random() * 56) + 45; 
                    await c.query(`INSERT INTO attendance (student_id, subject_id, percentage) VALUES (?, ?, ?)`, [sid, sub.id, attendance]);
                }
                
                const avg = totalMarks / subjects.length;
                const risk = avg < 60 ? 'High' : (avg < 75 ? 'Medium' : 'Low');
                const perf = avg > 85 ? 'Excellent' : (avg > 70 ? 'Good' : 'Needs Improvement');
                
                await c.query(
                    `INSERT INTO predictions (student_id, performance_level, risk_level) VALUES (?, ?, ?)`,
                    [sid, perf, risk]
                );
            }
            
            // Disciplinary per faculty's students randomly
            const issueTypes = ["Dress Code", "Late Arrival", "Mobile Phone", "Misbehavior", "Skipped Internal Exam"];
            for (let sid of facultyStudentIds) {
                if (Math.random() > 0.6) { // 40% chance of a discipline issue to show more robust risk
                     const randomIssue = issueTypes[Math.floor(Math.random() * issueTypes.length)];
                     await c.query(`INSERT INTO disciplinary_records (student_id, issue_type, description, date) VALUES (?, ?, ?, ?)`, 
                        [sid, randomIssue, `Mock disciplinary issue logged for ${randomIssue}.`, new Date().toISOString().split('T')[0]]);
                }
            }
            
            // Assignment 1 for this faculty
            const [assignTask1] = await c.query(`
                INSERT INTO faculty_assignments (faculty_id, title, description, submission_type, deadline, max_marks) 
                VALUES (?, 'Mid-Term Project Submission', 'Submit the code and lab record.', 'softcopy', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 100)
            `, [targetFacultyId]);
            const assignmentId1 = assignTask1.insertId;

            // Assignment 2 for this faculty
            const [assignTask2] = await c.query(`
                INSERT INTO faculty_assignments (faculty_id, title, description, submission_type, deadline, max_marks) 
                VALUES (?, 'Weekly Research Paper', 'Upload the PDF format of your paper.', 'softcopy', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 50)
            `, [targetFacultyId]);
            const assignmentId2 = assignTask2.insertId;

            for(let i=0; i<facultyStudentIds.length; i++) {
                const sid = facultyStudentIds[i];
                // Submissions for assignment 1
                const status1 = Math.random() > 0.3 ? 'Submitted' : 'Pending';
                const score1 = status1 === 'Submitted' ? (Math.floor(Math.random() * 20) + 80) : null;
                await c.query(
                    `INSERT INTO faculty_assignment_students (assignment_id, student_id, status, score) VALUES (?, ?, ?, ?)`,
                    [assignmentId1, sid, status1, score1]
                );

                // Submissions for assignment 2
                const status2 = Math.random() > 0.5 ? 'Submitted' : 'Pending';
                const score2 = status2 === 'Submitted' ? (Math.floor(Math.random() * 15) + 35) : null;
                await c.query(
                    `INSERT INTO faculty_assignment_students (assignment_id, student_id, status, score) VALUES (?, ?, ?, ?)`,
                    [assignmentId2, sid, status2, score2]
                );
            }
            
            // Queries for this faculty
            await c.query(
                `INSERT INTO queries (user_id, message, status) VALUES (?, ?, ?)`,
                [targetFacultyId, "Can you please reset the password for one of my students?", "Pending"]
            );
            await c.query(
                `INSERT INTO queries (user_id, message, status, admin_reply) VALUES (?, ?, ?, ?)`,
                [targetFacultyId, "The lab equipment for Subject CS201 is broken.", "Completed", "We have dispatched a technician. It will be fixed by tomorrow."]
            );
        }

        console.log("🎉 Seeding completely finished! You can now log in with the new demo accounts.");
        console.log("Sample Faculty Login: faculty1@college.edu / password123");
        console.log("Sample Student Login: student1@demo.edu / password123");

    } catch(err) {
        console.error("Seeding failed:", err);
    } finally {
        await c.end();
    }
}

seed();
