const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' }); // Ensure to run this from backend directory or it might not find .env

async function updateDb() {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'academic_forecast',
    });

    console.log('Connected to DB');

    await db.query(`
        CREATE TABLE IF NOT EXISTS faculty_assignments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          faculty_id INT,
          title VARCHAR(150) NOT NULL,
          description TEXT,
          materials VARCHAR(255),
          submission_type ENUM('softcopy', 'hardcopy', 'hardware') DEFAULT 'softcopy',
          max_size_mb INT,
          file_format VARCHAR(100),
          deadline DATE,
          max_marks INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);

    console.log('faculty_assignments table created or exists.');

    await db.query(`
        CREATE TABLE IF NOT EXISTS faculty_assignment_students (
          id INT AUTO_INCREMENT PRIMARY KEY,
          assignment_id INT,
          student_id INT,
          status ENUM('Pending', 'Submitted', 'Missing') DEFAULT 'Pending',
          score INT,
          FOREIGN KEY (assignment_id) REFERENCES faculty_assignments(id) ON DELETE CASCADE,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
          UNIQUE(assignment_id, student_id)
        );
    `);

    console.log('faculty_assignment_students table created or exists.');
    
    // Add forgot password / profile fields to users and faculty profiles if not existing
    // Check if column exists, if not add it
    // Wait, let's keep it simple. If we need reset_token we could add it.
    // For now we rely on a simpler approach if not required by DB.

    console.log('Database update complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating DB:', err);
    process.exit(1);
  }
}

updateDb();
