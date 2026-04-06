const mysql = require('mysql2/promise');

async function fixEmails() {
    const c = await mysql.createConnection({
        host: 'localhost', user: 'root', password: 'root', database: 'academic_forecast'
    });
    try {
        console.log("Fixing faculty emails...");
        const [facs] = await c.query("SELECT id, email FROM users WHERE role IN ('Faculty', 'faculty')");
        for (let f of facs) {
            let emailParts = f.email.split('@');
            if(emailParts.length === 2) {
                let namePart = emailParts[0];
                // Remove dr, mr, mrs, ms, prof if they are at the START of the email name
                // e.g., 'drsaranya' -> 'saranya', 'mrramkumar' -> 'ramkumar'
                let newNamePart = namePart.replace(/^(dr|mr|mrs|ms|prof)/i, '');
                if (newNamePart !== namePart) {
                    let newEmail = newNamePart + '@' + emailParts[1];
                    await c.query("UPDATE users SET email = ? WHERE id = ?", [newEmail, f.id]);
                }
            }
        }
        console.log("Emails fixed.");
    } catch(e) { console.error(e); }
    finally { await c.end(); }
}
fixEmails();
