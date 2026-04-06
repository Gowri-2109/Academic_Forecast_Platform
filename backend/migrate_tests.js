const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'academic_forecast'
  });
  
  try {
    console.log('Creating tests table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS tests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        total_marks INT NOT NULL,
        test_date DATE NOT NULL,
        duration_mins INT,
        created_by INT NOT NULL,
        status ENUM('Upcoming', 'Completed') DEFAULT 'Upcoming',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Creating test_marks table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS test_marks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        test_id INT NOT NULL,
        student_id INT NOT NULL,
        marks_obtained INT DEFAULT NULL,
        status ENUM('Assigned', 'Graded') DEFAULT 'Assigned',
        FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE(test_id, student_id)
      )
    `);

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await db.end();
    process.exit();
  }
}

run();
