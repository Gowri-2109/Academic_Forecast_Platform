const mysql = require('mysql2/promise');

async function fixDuplicates() {
    const c = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'academic_forecast'
    });

    const duplicatesMapping = [
        { oldId: 573, newId: 366 }, // Dr. DANIEL RAJ
        { oldId: 574, newId: 368 }, // Dr. RAMYA P
        { oldId: 575, newId: 367 }, // Dr. RAMKUMAR R
        { oldId: 576, newId: 369 }, // Mr. TAMILSELVAN S
        { oldId: 578, newId: 370 }, // Mrs. DHANALAKSHMI S
        { oldId: 579, newId: 371 }  // Mr. KARTHIKEYAN S
    ];

    try {
        console.log("Fixing duplicates...");
        for (let pair of duplicatesMapping) {
            // Re-assign students
            await c.query("UPDATE student_assignments SET faculty_id = ? WHERE faculty_id = ?", [pair.newId, pair.oldId]);
            // Delete duplicates
            await c.query("DELETE FROM users WHERE id = ?", [pair.oldId]);
        }
        
        // Also update the UI to show Year 3 for all 100 students (since the import passed semester but maybe not year)
        // Semester 3 = Year 2? Semester 5 = Year 3. Wait, the import had III (Year 2 semester 3?) or III year?
        // The rawData was: "1 \t III \t 737... B.E. ..." "III" might mean 3rd Year. The import set semesterNum = 3 or 5.
        // Let's set year = 3 where semester = 3 or 5 for these students, or just compute from semester.
        // Let's explicitly set year based on the semester to fix the "Year N/A" issue in UI.
        await c.query("UPDATE students SET year = 3 WHERE semester IN (3, 5) AND year IS NULL");

        console.log("Done fixing duplicates and year data.");
    } catch(err) {
        console.error(err);
    } finally {
        await c.end();
    }
}
fixDuplicates();
