const mysql = require('mysql2/promise');

async function removeTitles() {
    const c = await mysql.createConnection({
        host: 'localhost', user: 'root', password: 'root', database: 'academic_forecast'
    });
    try {
        console.log("Removing titles from faculty names...");
        
        const [facs] = await c.query("SELECT id, name FROM users WHERE role IN ('Faculty', 'faculty')");
        for (let f of facs) {
            let newName = f.name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s*/i, '').trim();
            if (newName !== f.name) {
                await c.query("UPDATE users SET name = ? WHERE id = ?", [newName, f.id]);
            }
        }
        
        const [profs] = await c.query("SELECT id, first_name FROM faculty_profiles");
        for (let p of profs) {
            let newFirstName = p.first_name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s*/i, '').trim();
            if (newFirstName !== p.first_name) {
                await c.query("UPDATE faculty_profiles SET first_name = ? WHERE id = ?", [newFirstName, p.id]);
            }
        }
        
        console.log("Titles removed successfully.");
    } catch(e) { console.error(e); }
    finally { await c.end(); }
}
removeTitles();
